import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { body } from 'express-validator';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createOpaqueToken, hashToken, signAccessToken, signRefreshToken } from '../services/token.service.js';
import { sendMail } from '../services/mail.service.js';
import { audit } from '../services/audit.service.js';

export const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol')
];
export const loginRules = [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()];

function cookieOptions() {
  return { httpOnly: true, sameSite: 'strict', secure: env.nodeEnv === 'production', signed: true };
}

async function issueTokens(user, req, res) {
  const rawRefresh = createOpaqueToken(48);
  const session = await Session.create({ user: user._id, refreshTokenHash: hashToken(rawRefresh), ip: req.ip, userAgent: req.headers['user-agent'], deviceName: req.headers['sec-ch-ua-platform'] || 'Browser' });
  const accessToken = signAccessToken(user, session);
  const refreshToken = signRefreshToken(user, session) + '.' + rawRefresh;
  res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: 30 * 24 * 60 * 60 * 1000 });
  return { accessToken, refreshToken, session };
}

export async function register(req, res, next) {
  try {
    const exists = await User.exists({ email: req.body.email });
    if (exists) throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS');
    const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password });
    const token = jwt.sign({ sub: user._id.toString() }, env.jwtEmailSecret, { expiresIn: '1d' });
    await sendMail({ to: user.email, subject: 'Verify your VaultShare account', html: `<p>Verify your account: ${env.clientUrl}/verify-email?token=${token}</p>` });
    await audit({ actor: user._id, action: 'auth.register', req });
    res.status(201).json({ user: sanitizeUser(user), message: 'Registration complete. Check email for verification.' });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password +twoFactor.secret');
    if (!user || !(await user.comparePassword(req.body.password))) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    if (user.twoFactor.enabled) {
      if (!req.body.totp || !speakeasy.totp.verify({ secret: user.twoFactor.secret, encoding: 'base32', token: req.body.totp })) throw new AppError('Two-factor code required', 401, 'TOTP_REQUIRED');
    }
    if (user.status === 'pending') user.status = 'active';
    user.loginActivity.unshift({ ip: req.ip, userAgent: req.headers['user-agent'], status: 'success' });
    await user.save();
    const tokens = await issueTokens(user, req, res);
    await audit({ actor: user._id, action: 'auth.login', req, metadata: { session: tokens.session._id } });
    res.json({ user: sanitizeUser(user), accessToken: tokens.accessToken });
  } catch (error) { next(error); }
}

export async function refresh(req, res, next) {
  try {
    const cookie = req.signedCookies.refreshToken || req.body.refreshToken;
    if (!cookie) throw new AppError('Refresh token missing', 401, 'REFRESH_REQUIRED');
    const [jwtPart, raw] = cookie.split('.');
    const decoded = jwt.verify(jwtPart, env.jwtRefreshSecret);
    const session = await Session.findOne({ _id: decoded.sid, user: decoded.sub, revokedAt: null });
    if (!session || session.refreshTokenHash !== hashToken(raw)) throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
    const user = await User.findById(decoded.sub);
    session.lastSeenAt = new Date();
    await session.save();
    const accessToken = signAccessToken(user, session);
    res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 });
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (error) { next(error); }
}

export async function logout(req, res, next) {
  try {
    if (req.session) { req.session.revokedAt = new Date(); await req.session.save(); }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (error) { next(error); }
}

export async function me(req, res) { res.json({ user: sanitizeUser(req.user) }); }

export async function enable2fa(req, res, next) {
  try {
    const secret = speakeasy.generateSecret({ name: `VaultShare (${req.user.email})` });
    req.user.twoFactor = { enabled: false, secret: secret.base32 };
    await req.user.save();
    res.json({ otpauthUrl: secret.otpauth_url, base32: secret.base32 });
  } catch (error) { next(error); }
}

export async function verify2fa(req, res, next) {
  try {
    const ok = speakeasy.totp.verify({ secret: req.user.twoFactor.secret, encoding: 'base32', token: req.body.token });
    if (!ok) throw new AppError('Invalid two-factor code', 422, 'INVALID_TOTP');
    req.user.twoFactor.enabled = true;
    await req.user.save();
    res.json({ message: 'Two-factor authentication enabled' });
  } catch (error) { next(error); }
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = createOpaqueToken();
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendMail({ to: user.email, subject: 'Reset your VaultShare password', html: `<p>${env.clientUrl}/reset-password?token=${token}</p>` });
    }
    res.json({ message: 'If an account exists, a reset email was sent.' });
  } catch (error) { next(error); }
}

export async function resetPassword(req, res, next) {
  try {
    const user = await User.findOne({ passwordResetToken: hashToken(req.body.token), passwordResetExpires: { $gt: new Date() } }).select('+passwordResetToken +passwordResetExpires');
    if (!user) throw new AppError('Reset token is invalid or expired', 400, 'INVALID_RESET');
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await Session.updateMany({ user: user._id }, { revokedAt: new Date() });
    res.json({ message: 'Password reset complete' });
  } catch (error) { next(error); }
}

export async function sessions(req, res, next) {
  try { res.json({ sessions: await Session.find({ user: req.user._id }).sort('-lastSeenAt') }); } catch (error) { next(error); }
}

export async function revokeSession(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    session.revokedAt = new Date();
    await session.save();
    await audit({ actor: req.user._id, action: 'auth.session_revoke', req, metadata: { session: session._id } });
    res.json({ message: 'Session revoked' });
  } catch (error) { next(error); }
}

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, avatar: user.avatar, storageUsed: user.storageUsed, storageLimit: user.storageLimit, preferences: user.preferences, twoFactorEnabled: user.twoFactor?.enabled };
}

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const transport = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
    })
  : null;

export async function sendMail({ to, subject, html }) {
  if (!transport) {
    logger.info(`Email skipped in dev: ${subject} -> ${to}`);
    return;
  }
  await transport.sendMail({ from: env.smtp.from, to, subject, html });
}

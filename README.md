# VaultShare

VaultShare is a MERN secure file sharing platform with encrypted uploads, signed sharing links, role-aware access, analytics, real-time activity, admin monitoring, and a premium responsive SaaS interface.

## Stack

- Frontend: React, Redux Toolkit, React Router, Axios, Framer Motion, Socket.IO client, Recharts, modern CSS
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, Socket.IO, Nodemailer, AES-256-GCM crypto
- Deployment target: GitHub repo now, Vercel later

## Structure

```txt
client/src/components    Reusable UI, layout, files, charts
client/src/pages         Landing, auth, dashboard, files, shares, workspace, analytics, settings, admin
client/src/store/slices  Auth, files, sharing, notifications, profile, workspace, analytics, theme
server/src/controllers   MVC controller layer
server/src/middleware    Auth, validation, upload, security, errors
server/src/models        Users, Files, Folders, Shares, Notifications, Activity Logs, Teams, Sessions, Versions
server/src/routes        REST API modules
server/src/services      Encryption, storage, mail, audit, tokens, AI placeholders, sockets
```

## API

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/2fa/setup`
- Files: `/api/files`, `/api/files/upload`, `/api/files/:id/download`, `/api/files/:id/versions`
- Shares: `/api/shares`, `/api/shares/public/:token`
- Workspaces: `/api/workspaces`, `/api/workspaces/:id/invite`
- Analytics: `/api/analytics`
- Admin: `/api/admin/overview`

## Security Flow

Login validates bcrypt passwords and optional TOTP 2FA, then issues a short-lived JWT access token and an HTTP-only signed refresh cookie. Sessions are stored in MongoDB with hashed refresh tokens, allowing device management and revocation.

Files are encrypted with AES-256-GCM before storage. Every upload receives a random per-file key, and that key is wrapped with `ENCRYPTION_MASTER_KEY`. Encrypted bytes are stored locally by default under `server/storage/encrypted`; the storage service is isolated so S3 or Cloudinary can replace it later.

Generate a production encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Development

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
npm install --workspaces
npm run dev
```

MongoDB must be running locally, and the app expects:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Vercel Later

This repo includes `vercel.json` for the React frontend. When you deploy later, set:

- `VITE_API_URL`
- `VITE_SOCKET_URL`

The backend can be deployed separately when you are ready.

## Hardening Checklist

- Move the master key to a secrets manager.
- Replace local encrypted storage with private S3 or authenticated Cloudinary.
- Add a real malware scanner and quarantine workflow.
- Add multipart resumable chunk upload persistence.
- Add CSRF token middleware for cookie-only browser auth.
- Route audit logs into a SIEM and alert on suspicious access patterns.
- Replace AI placeholders with OCR and governed LLM summarization.

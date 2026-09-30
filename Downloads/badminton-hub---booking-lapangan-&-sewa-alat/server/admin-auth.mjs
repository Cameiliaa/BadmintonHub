import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import dotenv from 'dotenv';

export function createAdminAuth({ root = process.cwd(), credentials, now = Date.now } = {}) {
  const env = credentials ?? { ...dotenv.config({ path: resolve(root, '.env.local'), quiet: true }).parsed, ...process.env };
  const sessions = new Map();
  const attempts = new Map();
  const ttl = 8 * 60 * 60 * 1000;
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2kb' }));
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET' && (req.headers['sec-fetch-site'] === 'cross-site' ||
      (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host))) {
      return res.status(403).json({ error: 'Permintaan tidak diizinkan.' });
    }
    next();
  });
  function session(req) {
    const token = /(?:^|;\s*)bh_admin=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie ?? '')?.[1];
    const expires = sessions.get(token);
    if (!expires || expires <= now()) {
      sessions.delete(token);
      return null;
    }
    return token;
  }
  function cookie(req, token, maxAge) {
    return `bh_admin=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${req.socket.encrypted || env.ADMIN_COOKIE_SECURE === 'true' ? '; Secure' : ''}`;
  }
  app.get('/session', (req, res) => res.json({ authenticated: !!session(req) }));
  app.post('/login', (req, res) => {
    const configured = /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH ?? '') && env.ADMIN_USERNAME;
    if (!configured) return res.status(503).json({ error: 'Akun admin belum disiapkan. Jalankan npm run admin:setup di terminal server.' });
    const key = req.socket.remoteAddress;
    for (const [ip, value] of attempts) if (value.until <= now()) attempts.delete(ip);
    const attempt = attempts.get(key) ?? { count: 0, until: now() + 15 * 60 * 1000 };
    if (attempt.count >= 5) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || password.length > 256) return res.status(400).json({ error: 'Isi username dan password dengan benar.' });
    const [salt, hash] = env.ADMIN_PASSWORD_HASH.split(':');
    const valid = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
    if (!valid || username !== env.ADMIN_USERNAME) {
      attempt.count++;
      attempts.set(key, attempt);
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    attempts.delete(key);
    for (const [token, expires] of sessions) if (expires <= now()) sessions.delete(token);
    sessions.delete(session(req));
    const token = randomBytes(32).toString('hex');
    sessions.set(token, now() + ttl);
    res.setHeader('Set-Cookie', cookie(req, token, ttl / 1000));
    res.json({ authenticated: true });
  });
  app.get('/panel', (req, res) => {
    if (!session(req)) return res.status(401).json({ error: 'Silakan login kembali.' });
    res.type('html').send(readFileSync(resolve(root, 'server/admin-panel.html'), 'utf8'));
  });
  app.post('/logout', (req, res) => {
    sessions.delete(session(req));
    res.setHeader('Set-Cookie', cookie(req, '', 0));
    res.json({ authenticated: false });
  });
  app.use((err, req, res, next) => res.status(400).json({ error: 'Permintaan tidak valid.' }));
  return app;
}

export function adminAuthPlugin() {
  function configure(server) {
    server.middlewares.use((req, res, next) => {
      let pathname;
      try { pathname = decodeURIComponent((req.url ?? '/').split('?')[0]).replaceAll('\\', '/'); }
      catch { res.statusCode = 400; return res.end(); }
      if (/(?:^|\/)(?:server|scripts|\.git)(?:\/|$)|(?:^|\/)\.env(?:[./]|$)/i.test(pathname)) {
        res.statusCode = 403;
        return res.end('Forbidden');
      }
      next();
    });
    server.middlewares.use('/api/admin', createAdminAuth());
  }
  return { name: 'admin-auth', configureServer: configure, configurePreviewServer: configure };
}

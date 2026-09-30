import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import express from 'express';
import { createAdminAuth } from './admin-auth.mjs';

test('admin login, protected panel, logout, expiry, throttling and origin protection', async () => {
  const salt = 'a'.repeat(32);
  let time = Date.now();
  const app = express();
  app.use('/api/admin', createAdminAuth({ credentials: {
    ADMIN_USERNAME: 'test-admin',
    ADMIN_PASSWORD_HASH: `${salt}:${scryptSync('test-password-123', salt, 64).toString('hex')}`
  }, now: () => time }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  const post = (path, body, cookie = '', extraHeaders = {}) => fetch(`${base}/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', cookie, ...extraHeaders }, body: JSON.stringify(body)
  });
  try {
    assert.equal((await fetch(`${base}/panel`)).status, 401);
    assert.equal((await fetch(`${base}/panel`, { headers: { cookie: `bh_admin=${'a'.repeat(64)}` } })).status, 401);
    assert.equal((await post('login', { username: 'test-admin', password: 'wrong' })).status, 401);
    assert.equal((await post('login', { username: 'test-admin', password: 'test-password-123' }, '', { origin: 'https://other.example' })).status, 403);
    const login = await post('login', { username: 'test-admin', password: 'test-password-123' });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly; SameSite=Strict/);
    const cookie = setCookie.split(';')[0];
    assert.equal((await fetch(`${base}/session`, { headers: { cookie } }).then(r => r.json())).authenticated, true);
    const panel = await fetch(`${base}/panel`, { headers: { cookie } });
    assert.equal(panel.status, 200);
    assert.match(await panel.text(), /Admin Dashboard/);
    await post('logout', {}, cookie);
    assert.equal((await fetch(`${base}/panel`, { headers: { cookie } })).status, 401);
    const second = await post('login', { username: 'test-admin', password: 'test-password-123' });
    const secondCookie = second.headers.get('set-cookie').split(';')[0];
    time += 8 * 60 * 60 * 1000 + 1;
    assert.equal((await fetch(`${base}/panel`, { headers: { cookie: secondCookie } })).status, 401);
    for (let i = 0; i < 5; i++) assert.equal((await post('login', { username: 'test-admin', password: 'wrong' })).status, 401);
    assert.equal((await post('login', { username: 'test-admin', password: 'test-password-123' })).status, 429);
    time += 15 * 60 * 1000 + 1;
    assert.equal((await post('login', { username: 'test-admin', password: 'test-password-123' })).status, 200);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('missing credentials fail closed', async () => {
  const server = createAdminAuth({ credentials: {} }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 503);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

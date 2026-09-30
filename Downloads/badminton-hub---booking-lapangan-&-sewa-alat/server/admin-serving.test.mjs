import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, preview } from 'vite';
import { Script, createContext } from 'node:vm';

test('dev and preview protect admin panel and serve customer page', async () => {
  for (const mode of ['dev', 'preview']) {
    const server = mode === 'dev'
      ? await createServer({ server: { port: 0, host: '127.0.0.1', open: false } })
      : await preview({ preview: { port: 0, host: '127.0.0.1', open: false } });
    if (mode === 'dev') await server.listen();
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    try {
      const page = await fetch(base).then(r => r.text());
      assert.ok(page.includes('/js/navigation.js'));
      assert.ok(page.includes('id="admin-login-modal"'));
      assert.ok(page.includes('id="customer-view"'));
      assert.ok(!page.includes('<!-- include:'));
      assert.ok(!page.includes('Admin Dashboard Badminton Hub'));
      assert.ok(!page.includes('Switch to Admin View'));
      assert.equal((await fetch(`${base}/api/admin/panel`)).status, 401);
      const context = createContext({ window: { addEventListener() {} }, document: { addEventListener() {} }, tailwind: {} });
      for (const match of page.matchAll(/<script src="(\/[^\"]+)"[^>]*><\/script>/g)) {
        const response = await fetch(base + match[1]);
        assert.equal(response.status, 200, match[1]);
        const code = await response.text();
        const script = new Script(code, { filename: match[1] });
        // Authentication requires browser DOM; all other scripts must load together
        // without missing globals or conflicting declarations.
        if (!match[1].endsWith('/admin/auth.js')) script.runInContext(context);
      }
      for (const name of ['handleBrandLogoClick', 'renderScheduleGrid', 'openCheckoutModal', 'openLatestTicketModal', 'renderAdminDashboard', 'executeAdminApproval']) {
        assert.equal(new Script(`typeof ${name}`).runInContext(context), 'function', name);
      }
      assert.equal((await fetch(`${base}/css/site.css`)).status, 200);
      for (const path of ['/server/admin-panel.html', '/server/admin-auth.mjs', '/.env.local']) {
        const response = await fetch(base + path);
        const body = await response.text();
        assert.ok(!body.includes('Admin Dashboard Badminton Hub'));
        assert.ok(!body.includes('scryptSync'));
        if (mode === 'dev') assert.equal(response.status, 403);
      }
    } finally {
      if (mode === 'dev') await server.close();
      else await new Promise(resolve => server.httpServer.close(resolve));
    }
  }
});

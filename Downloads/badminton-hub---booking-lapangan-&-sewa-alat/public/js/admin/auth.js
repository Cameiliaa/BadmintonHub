(() => {
  const modal = document.getElementById('admin-login-modal');
  const form = document.getElementById('admin-login-form');
  const error = document.getElementById('admin-login-error');
  const submit = document.getElementById('admin-login-submit');
  let clicks = [];
  let authenticated = false;
  let previousFocus;
  let busy = false;
  async function request(path, options = {}) {
    const response = await fetch(`/api/admin/${path}`, { credentials: 'same-origin', ...options });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Server tidak dapat dihubungi. Coba lagi.');
    }
    return response;
  }
  function openLogin(message = '') {
    previousFocus = document.activeElement;
    modal.hidden = false;
    modal.style.display = 'flex';
    error.textContent = message;
    document.getElementById('admin-username').focus();
  }
  function closeLogin() {
    if (busy) return;
    modal.hidden = true;
    modal.style.display = 'none';
    form.reset();
    previousFocus?.focus();
  }
  async function enterAdmin() {
    const response = await request('panel');
    const panel = await response.text();
    document.getElementById('admin-view').outerHTML = panel;
    authenticated = true;
    if (AppState.currentRole !== 'ADMIN') applyAdminView(true);
    closeLogin();
  }
  window.registerAdminLogoClick = () => {
    if (authenticated) return;
    const time = Date.now();
    clicks = clicks.filter(value => time - value < 2500);
    clicks.push(time);
    if (clicks.length >= 5) { clicks = []; openLogin(); }
  };
  window.toggleRole = () => {
    if (authenticated) location.assign('/');
    else openLogin();
  };
  window.logoutAdmin = async () => {
    try {
      await request('logout', { method: 'POST' });
      location.replace('/');
    } catch (err) { showToast('Gagal keluar. Periksa koneksi dan coba lagi.', 'error'); }
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Memeriksa…';
    error.textContent = '';
    try {
      await request('login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value })
      });
      busy = false;
      await enterAdmin();
    } catch (err) {
      error.textContent = err.message;
      form.password.value = '';
      form.password.focus();
    } finally {
      busy = false;
      submit.disabled = false;
      submit.textContent = 'Masuk';
    }
  });
  document.getElementById('admin-login-close').addEventListener('click', closeLogin);
  modal.addEventListener('click', event => { if (event.target === modal) closeLogin(); });
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLogin();
    if (event.key === 'Tab') {
      const elements = [...modal.querySelectorAll('button:not(:disabled), input')];
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  async function checkSession(restore = false) {
    try {
      const response = await request('session');
      const result = await response.json();
      if (result.authenticated && restore) await enterAdmin();
      else if (!result.authenticated && authenticated) location.replace('/');
    } catch {
      if (authenticated) location.replace('/');
    }
  }
  checkSession(true);
  setInterval(() => { if (authenticated) checkSession(); }, 30000);
  window.addEventListener('focus', () => { if (authenticated) checkSession(); });
})();

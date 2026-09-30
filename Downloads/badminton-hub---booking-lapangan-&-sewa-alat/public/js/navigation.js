// ==================== NAVIGATION & ROLE SWITCHING ====================
function handleBrandLogoClick(e) {
  if (e) e.preventDefault();
  registerAdminLogoClick();
  if (AppState.currentRole === 'ADMIN') {
    switchAdminTab('bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const el = document.getElementById('beranda');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function navigateToSection(sectionId, e) {
  if (e) e.preventDefault();

  const sectionLabels = {
    'beranda': 'Beranda',
    'jadwal': 'Jadwal & Lapangan',
    'sewa-alat': 'Sewa Alat & Kafe',
    'fasilitas': 'Fasilitas'
  };

  if (AppState.currentRole === 'ADMIN') {
    toggleRole(true);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
    showToast(`Membuka halaman penyewa: ${sectionLabels[sectionId] || sectionId}`, 'info');
  } else {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function applyAdminView(silent = false) {
  if (AppState.currentRole === 'PENYEWA') {
    AppState.currentRole = 'ADMIN';
    document.getElementById('customer-view').classList.add('hidden');
    document.getElementById('admin-view').classList.remove('hidden');

    // Header Navigation: Hide customer links (keep center clean in Admin mode)
    const custNav = document.getElementById('customer-nav-links');
    if (custNav) {
      custNav.classList.add('hidden');
      custNav.classList.remove('md:flex');
    }

    // Hide Cart & Ticket Button in Header
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.classList.add('hidden');
    const ticketNavBtn = document.getElementById('my-ticket-nav-btn');
    if (ticketNavBtn) ticketNavBtn.classList.add('hidden');

    // Update Brand Subtitle & Icon
    const brandSub = document.getElementById('brand-subtitle');
    if (brandSub) brandSub.innerText = 'Portal Pengelola Arena';
    const brandIconBox = document.getElementById('brand-logo-icon');
    if (brandIconBox) {
      brandIconBox.className = 'w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform';
    }
    const brandIconLucide = document.getElementById('brand-icon-lucide');
    if (brandIconLucide) brandIconLucide.setAttribute('data-lucide', 'shield');

    // Update Role Badge (Only show in Admin mode)
    const badge = document.getElementById('role-badge');
    if (badge) {
      badge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap shrink-0';
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Mode: ADMINISTRATOR`;
    }

    // Update Role Toggle Button (Single clean exit action)
    const roleBtn = document.getElementById('role-toggle-btn');
    if (roleBtn) {
      roleBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm border border-slate-700/60 whitespace-nowrap shrink-0';
    }
    const roleText = document.getElementById('role-toggle-text');
    if (roleText) roleText.innerText = 'Keluar Admin';
    const roleIcon = document.getElementById('role-toggle-icon');
    if (roleIcon) roleIcon.setAttribute('data-lucide', 'arrow-left');

    // Mobile Nav: switch to admin mobile nav
    const custMobNav = document.getElementById('customer-mobile-nav');
    if (custMobNav) {
      custMobNav.classList.add('hidden');
      custMobNav.classList.remove('flex');
    }
    const admMobNav = document.getElementById('admin-mobile-nav');
    if (admMobNav) {
      admMobNav.classList.remove('hidden');
      admMobNav.classList.add('flex');
    }

    renderAdminDashboard();
    if (!silent) showToast('Beralih ke Portal Administrator', 'info');
  } else {
    AppState.currentRole = 'PENYEWA';
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('customer-view').classList.remove('hidden');

    // Header Navigation: Show customer links
    const custNav = document.getElementById('customer-nav-links');
    if (custNav) {
      custNav.classList.remove('hidden');
      custNav.classList.add('md:flex');
    }

    // Show Cart in Header
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.classList.remove('hidden');

    // Show Ticket Button if customer has made a booking
    if (AppState.latestCustomerBookingId) {
      const ticketNavBtn = document.getElementById('my-ticket-nav-btn');
      if (ticketNavBtn) ticketNavBtn.classList.remove('hidden');
    }

    // Reset Brand Subtitle & Icon
    const brandSub = document.getElementById('brand-subtitle');
    if (brandSub) brandSub.innerText = 'Arena & Pro Store';
    const brandIconBox = document.getElementById('brand-logo-icon');
    if (brandIconBox) {
      brandIconBox.className = 'w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform';
    }
    const brandIconLucide = document.getElementById('brand-icon-lucide');
    if (brandIconLucide) brandIconLucide.setAttribute('data-lucide', 'activity');

    // Update Role Badge (Hide in customer mode so links have plenty of room)
    const badge = document.getElementById('role-badge');
    if (badge) {
      badge.className = 'hidden';
    }

    // Update Role Toggle Button
    const roleBtn = document.getElementById('role-toggle-btn');
    if (roleBtn) {
      roleBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm whitespace-nowrap shrink-0';
    }
    const roleText = document.getElementById('role-toggle-text');
    if (roleText) roleText.innerText = 'Keluar Admin';
    const roleIcon = document.getElementById('role-toggle-icon');
    if (roleIcon) roleIcon.setAttribute('data-lucide', 'shield-check');

    // Mobile Nav: switch to customer mobile nav
    const custMobNav = document.getElementById('customer-mobile-nav');
    if (custMobNav) {
      custMobNav.classList.remove('hidden');
      custMobNav.classList.add('flex');
    }
    const admMobNav = document.getElementById('admin-mobile-nav');
    if (admMobNav) {
      admMobNav.classList.add('hidden');
      admMobNav.classList.remove('flex');
    }

    renderScheduleGrid();
    if (!silent) showToast('Beralih ke Tampilan Penyewa', 'success');
  }
  lucide.createIcons();
}


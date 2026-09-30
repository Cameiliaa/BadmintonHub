// ==================== ADMIN DASHBOARD TAB & MANAGEMENT ====================
function switchAdminTab(tabName) {
  AppState.adminTab = tabName;

  const tabs = ['bookings', 'courts', 'products', 'facilities'];
  tabs.forEach(t => {
    const btn = document.getElementById(`admin-tab-${t}-btn`);
    const mobBtn = document.getElementById(`admin-mob-${t}-btn`);
    const panel = document.getElementById(`admin-panel-${t}`);

    if (t === tabName) {
      if (btn) {
        btn.className = 'px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 bg-slate-900 text-white shadow-md ring-2 ring-emerald-500/30 scale-[1.02]';
      }
      if (mobBtn) {
        mobBtn.className = 'flex flex-col items-center gap-1 text-emerald-400 relative font-black';
      }
      if (panel) {
        panel.classList.remove('hidden');
        panel.classList.remove('admin-tab-fade');
        void panel.offsetWidth; // Trigger reflow so CSS animation restarts cleanly
        panel.classList.add('admin-tab-fade');
      }
    } else {
      if (btn) {
        btn.className = 'px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200';
      }
      if (mobBtn) {
        mobBtn.className = 'flex flex-col items-center gap-1 text-slate-400 hover:text-white transition';
      }
      if (panel) {
        panel.classList.add('hidden');
        panel.classList.remove('admin-tab-fade');
      }
    }
  });

  lucide.createIcons();
}

function renderAdminDashboard() {
  // 1. Metric calculations
  const totalRev = AppState.adminBookings
    .filter(b => b.status === 'LUNAS' || b.status === 'Disetujui')
    .reduce((sum, b) => sum + b.total, 3450000);
  document.getElementById('admin-metric-revenue').innerText = formatRp(totalRev);

  const pendingCount = AppState.adminBookings.filter(b => b.status === 'Menunggu Verifikasi').length;
  document.getElementById('admin-metric-pending').innerText = `${pendingCount} Pesanan`;
  const pendingBadge = document.getElementById('admin-tab-pending-badge');
  if (pendingBadge) pendingBadge.innerText = pendingCount;
  const mobPendingBadge = document.getElementById('admin-mob-pending-badge');
  if (mobPendingBadge) mobPendingBadge.innerText = pendingCount;

  const activeCourtsCount = AppState.courts.filter(c => !c.isLocked).length;
  const courtStatusEl = document.querySelector('#admin-view .grid .text-2xl.font-black.text-emerald-600');
  if (courtStatusEl) courtStatusEl.innerText = `${activeCourtsCount} Siap Main`;

  const courtBadge = document.getElementById('admin-tab-courts-badge');
  if (courtBadge) courtBadge.innerText = `${AppState.courts.length} Lapangan`;

  const prodBadge = document.getElementById('admin-tab-products-badge');
  if (prodBadge) prodBadge.innerText = `${AppState.products.length} Produk`;

  const facBadge = document.getElementById('admin-tab-facilities-badge');
  if (facBadge) facBadge.innerText = `${AppState.facilities.length} Fasilitas`;

  // 2. Render Sub-Modules
  renderAdminBookingsTable();
  renderAdminScheduleMatrix();
  renderAdminCourts();
  renderAdminHours();
  renderAdminProducts();
  renderAdminFacilities();

  // 3. Sync Active Tab & Animation
  switchAdminTab(AppState.adminTab || 'bookings');

  lucide.createIcons();
}

function setBookingFilter(filter) {
  AppState.bookingFilter = filter;
  const filters = ['all', 'pending', 'paid', 'rejected'];
  filters.forEach(f => {
    const btn = document.getElementById(`filter-${f}-btn`);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-3 py-1 rounded-lg font-bold bg-white text-slate-900 shadow-xs transition';
      } else {
        btn.className = 'px-3 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 transition';
      }
    }
  });
  renderAdminBookingsTable();
}

function renderAdminBookingsTable() {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filter = AppState.bookingFilter || 'all';
  let list = AppState.adminBookings;

  if (filter === 'pending') {
    list = list.filter(b => b.status === 'Menunggu Verifikasi');
  } else if (filter === 'paid') {
    list = list.filter(b => b.status === 'LUNAS' || b.status === 'Disetujui');
  } else if (filter === 'rejected') {
    list = list.filter(b => b.status === 'DITOLAK' || b.status === 'Ditolak' || b.status === 'DIBATALKAN');
  }

  const countBadge = document.getElementById('admin-table-count');
  if (countBadge) {
    countBadge.innerText = `${list.length} Pesanan`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-12 text-center text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="font-bold text-slate-600 text-sm">Tidak ada pesanan pada filter ini</p>
          <p class="text-xs text-slate-400 mt-0.5">Semua data verifikasi tersinkronisasi secara otomatis.</p>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  list.forEach((b) => {
    const originalIdx = AppState.adminBookings.findIndex(item => item.id === b.id);
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';

    let statusBadge = '';
    if (b.status === 'LUNAS' || b.status === 'Disetujui') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">LUNAS</span>`;
    } else if (b.status === 'DITOLAK' || b.status === 'Ditolak') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">DITOLAK</span>`;
    } else if (b.status === 'DIBATALKAN') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">DIBATALKAN</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">MENUNGGU VERIFIKASI</span>`;
    }

    const isCancelledOrRejected = b.status === 'DITOLAK' || b.status === 'Ditolak' || b.status === 'DIBATALKAN';

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${b.id}</td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-slate-900">${b.name}</div>
        <div class="text-[11px] text-slate-500 font-mono">${b.phone}</div>
      </td>
      <td class="py-3.5 px-4 font-semibold text-emerald-700">${b.email}</td>
      <td class="py-3.5 px-4 max-w-xs text-slate-700 truncate" title="${b.details}">${b.details}</td>
      <td class="py-3.5 px-4 font-mono font-extrabold text-slate-900">${formatRp(b.total)}</td>
      <td class="py-3.5 px-4">
        <button onclick="openAdminVerifyModal(${originalIdx})" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition">
          <i data-lucide="file-search" class="w-3.5 h-3.5"></i> Lihat Struk QRIS
        </button>
      </td>
      <td class="py-3.5 px-4">${statusBadge}</td>
      <td class="py-3.5 px-4 text-right">
        <div class="inline-flex items-center gap-1.5 justify-end flex-wrap">
          <button onclick="openAdminVerifyModal(${originalIdx})" class="px-2.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-xs" title="Tinjau & Verifikasi">
            <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Verifikasi</span>
          </button>
          ${!isCancelledOrRejected ? `
            <button onclick="openRescheduleModal('${b.id}')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 border border-blue-200" title="Reschedule / Pindah Jadwal">
              <i data-lucide="calendar-sync" class="w-3.5 h-3.5"></i>
              <span>Reschedule</span>
            </button>
            <button onclick="confirmCancelBooking('${b.id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 border border-red-200" title="Batalkan Reservasi">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}


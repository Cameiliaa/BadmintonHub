// ==================== COURT MANAGEMENT FUNCTIONS ====================
function renderAdminCourts() {
  const container = document.getElementById('admin-courts-cards-container');
  if (!container) return;
  container.innerHTML = '';

  if (AppState.courts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
        <p>Belum ada lapangan yang terdaftar.</p>
        <button onclick="openCourtModal()" class="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Tambah Lapangan Sekarang</button>
      </div>
    `;
    return;
  }

  AppState.courts.forEach(court => {
    const isLocked = court.isLocked;
    const card = document.createElement('div');
    card.className = `p-5 rounded-2xl bg-white border ${isLocked ? 'border-amber-300' : 'border-slate-200'} shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition`;
    
    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isLocked ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}">
              ${isLocked ? 'MAINTENANCE / TERKUNCI' : court.type}
            </span>
            <h4 class="text-base font-extrabold text-slate-900 mt-1">${court.name}</h4>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Tarif Sewa</span>
            <span class="text-base font-black text-emerald-600 font-mono">${formatRp(court.basePrice)}</span>
            <span class="text-[10px] text-slate-400">/ jam</span>
          </div>
        </div>

        <p class="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          ${court.spec}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button onclick="openCourtModal('${court.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
          <span>Edit Harga & Info</span>
        </button>

        <div class="flex items-center gap-1.5">
          <button onclick="toggleCourtLock('${court.id}')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${isLocked ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}" title="Kunci / Buka Lapangan">
            <i data-lucide="${isLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteCourt('${court.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus Lapangan">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openCourtModal(courtId = null) {
  const modal = document.getElementById('court-modal');
  const title = document.getElementById('court-modal-title');
  const idInput = document.getElementById('court-form-id');
  const nameInput = document.getElementById('court-form-name');
  const typeInput = document.getElementById('court-form-type');
  const specInput = document.getElementById('court-form-spec');
  const priceInput = document.getElementById('court-form-price');
  const lockedInput = document.getElementById('court-form-locked');

  if (courtId) {
    const court = AppState.courts.find(c => c.id === courtId);
    if (!court) return;
    title.innerText = 'Edit Lapangan & Harga: ' + court.name;
    idInput.value = court.id;
    nameInput.value = court.name;
    typeInput.value = court.type;
    specInput.value = court.spec;
    priceInput.value = court.basePrice;
    lockedInput.checked = court.isLocked || false;
  } else {
    const nextNum = AppState.courts.length + 1;
    title.innerText = 'Tambah Lapangan Baru';
    idInput.value = '';
    nameInput.value = `Court ${nextNum} Indoor`;
    typeInput.value = 'Standard Tournament';
    specInput.value = 'Karpet Vinyl PBSI Hijau · LED 800 Lux · Sirkulasi Exhaust Blower';
    priceInput.value = 55000;
    lockedInput.checked = false;
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeCourtModal() {
  document.getElementById('court-modal').classList.add('hidden');
}

function saveCourtForm(e) {
  e.preventDefault();
  const id = document.getElementById('court-form-id').value;
  const name = document.getElementById('court-form-name').value.trim();
  const type = document.getElementById('court-form-type').value.trim();
  const spec = document.getElementById('court-form-spec').value.trim();
  const price = parseInt(document.getElementById('court-form-price').value, 10) || 50000;
  const isLocked = document.getElementById('court-form-locked').checked;

  if (!name) {
    showToast('Nama lapangan wajib diisi!', 'error');
    return;
  }

  if (id) {
    const court = AppState.courts.find(c => c.id === id);
    if (court) {
      court.name = name;
      court.type = type;
      court.spec = spec;
      court.basePrice = price;
      court.isLocked = isLocked;
      showToast(`Data & harga ${name} berhasil diperbarui!`, 'success');
    }
  } else {
    const newId = 'court-' + Date.now();
    AppState.courts.push({
      id: newId,
      name: name,
      type: type,
      spec: spec,
      basePrice: price,
      isLocked: isLocked
    });
    showToast(`Lapangan baru ${name} dengan tarif ${formatRp(price)}/jam berhasil ditambahkan!`, 'success');
  }

  closeCourtModal();
  renderScheduleGrid();
  renderAdminDashboard();
}

function deleteCourt(courtId) {
  if (AppState.courts.length <= 1) {
    showToast('Tidak bisa menghapus lapangan! Minimal harus ada 1 lapangan aktif.', 'error');
    return;
  }

  const court = AppState.courts.find(c => c.id === courtId);
  if (!court) return;

  if (confirm(`Yakin ingin menghapus ${court.name}? Semua slot jadwal lapangan ini akan dihapus.`)) {
    AppState.courts = AppState.courts.filter(c => c.id !== courtId);
    // Remove from cart if any
    AppState.cart = AppState.cart.filter(item => item.courtId !== courtId);
    updateCartUI();
    renderScheduleGrid();
    renderAdminDashboard();
    showToast(`${court.name} berhasil dihapus dari sistem.`, 'info');
  }
}

function toggleCourtLock(courtId) {
  const court = AppState.courts.find(c => c.id === courtId);
  if (court) {
    court.isLocked = !court.isLocked;
    showToast(`${court.name} sekarang ${court.isLocked ? 'TERKUNCI (MAINTENANCE)' : 'DIBUKA (SIAP MAIN)'}.`);
    renderAdminDashboard();
    renderScheduleGrid();
  }
}


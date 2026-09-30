// ==================== VENUE FACILITIES MANAGEMENT ====================
const FACILITY_AVAILABLE_ICONS = [
  { name: 'sun-medium', label: 'Lampu LED' },
  { name: 'shower-head', label: 'Shower Panas' },
  { name: 'wifi', label: 'WiFi Cepat' },
  { name: 'shield-check', label: 'Parkir Aman' },
  { name: 'coffee', label: 'Kafe/Kantin' },
  { name: 'lock', label: 'Loker Kunci' },
  { name: 'sparkles', label: 'Full AC' },
  { name: 'wind', label: 'Blower Sirkulasi' },
  { name: 'heart-pulse', label: 'P3K Medis' },
  { name: 'users', label: 'Lounge' },
  { name: 'trophy', label: 'Turnamen' },
  { name: 'car', label: 'Valet/Akses' }
];

function renderFacilities() {
  const container = document.getElementById('facilities-grid');
  if (!container) return;
  container.innerHTML = '';

  AppState.facilities.forEach(fac => {
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition group';
    card.innerHTML = `
      <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
        <i data-lucide="${fac.icon || 'sparkles'}" class="w-6 h-6"></i>
      </div>
      <h3 class="text-base font-bold text-slate-900">${fac.title}</h3>
      <p class="text-xs text-slate-500 mt-2 leading-relaxed">
        ${fac.desc}
      </p>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function renderAdminFacilities() {
  const container = document.getElementById('admin-facilities-cards-container');
  if (!container) return;
  container.innerHTML = '';

  if (AppState.facilities.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
        <p>Belum ada fasilitas yang ditambahkan.</p>
        <button onclick="openFacilityModal()" class="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Tambah Fasilitas Sekarang</button>
      </div>
    `;
    return;
  }

  AppState.facilities.forEach(fac => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition';

    card.innerHTML = `
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <i data-lucide="${fac.icon || 'sparkles'}" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-extrabold text-slate-900 text-sm leading-snug">${fac.title}</h4>
            <span class="text-[10px] text-slate-400 font-mono">Ikon: ${fac.icon}</span>
          </div>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          ${fac.desc}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button onclick="openFacilityModal('${fac.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
          <span>Edit Fasilitas</span>
        </button>
        <button onclick="deleteFacility('${fac.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus Fasilitas">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function openFacilityModal(facId = null) {
  const modal = document.getElementById('facility-modal');
  const title = document.getElementById('facility-modal-title');
  const idInput = document.getElementById('fac-form-id');
  const titleInput = document.getElementById('fac-form-title');
  const descInput = document.getElementById('fac-form-desc');
  const iconInput = document.getElementById('fac-form-icon');

  let currentIcon = 'sun-medium';

  if (facId) {
    const fac = AppState.facilities.find(f => f.id === facId);
    if (!fac) return;
    title.innerText = 'Edit Fasilitas: ' + fac.title;
    idInput.value = fac.id;
    titleInput.value = fac.title;
    descInput.value = fac.desc;
    currentIcon = fac.icon || 'sun-medium';
    iconInput.value = currentIcon;
  } else {
    title.innerText = 'Tambah Fasilitas Baru';
    idInput.value = '';
    titleInput.value = '';
    descInput.value = '';
    currentIcon = 'sun-medium';
    iconInput.value = currentIcon;
  }

  renderFacilityIconOptions(currentIcon);
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function renderFacilityIconOptions(selectedIcon) {
  const container = document.getElementById('fac-icon-options');
  if (!container) return;
  container.innerHTML = '';

  FACILITY_AVAILABLE_ICONS.forEach(item => {
    const isSelected = item.name === selectedIcon;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.onclick = () => selectFacilityIcon(item.name);
    btn.className = `p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
      isSelected 
        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-2 ring-emerald-500/30' 
        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
    }`;
    btn.innerHTML = `
      <i data-lucide="${item.name}" class="w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}"></i>
      <span class="text-[9px] font-semibold truncate max-w-full">${item.label}</span>
    `;
    container.appendChild(btn);
  });
  lucide.createIcons();
}

function selectFacilityIcon(iconName) {
  document.getElementById('fac-form-icon').value = iconName;
  renderFacilityIconOptions(iconName);
}

function closeFacilityModal() {
  document.getElementById('facility-modal').classList.add('hidden');
}

function saveFacilityForm(e) {
  e.preventDefault();
  const id = document.getElementById('fac-form-id').value;
  const title = document.getElementById('fac-form-title').value.trim();
  const desc = document.getElementById('fac-form-desc').value.trim();
  const icon = document.getElementById('fac-form-icon').value.trim() || 'sparkles';

  if (!title || !desc) {
    showToast('Judul dan deskripsi fasilitas wajib diisi!', 'error');
    return;
  }

  if (id) {
    const fac = AppState.facilities.find(f => f.id === id);
    if (fac) {
      fac.title = title;
      fac.desc = desc;
      fac.icon = icon;
      showToast(`Fasilitas "${title}" berhasil diperbarui!`, 'success');
    }
  } else {
    const newId = 'fac-' + Date.now();
    AppState.facilities.push({
      id: newId,
      title: title,
      desc: desc,
      icon: icon
    });
    showToast(`Fasilitas baru "${title}" berhasil ditambahkan!`, 'success');
  }

  closeFacilityModal();
  renderFacilities();
  renderAdminDashboard();
}

function deleteFacility(facId) {
  if (AppState.facilities.length <= 1) {
    showToast('Minimal harus ada 1 fasilitas arena!', 'error');
    return;
  }

  const fac = AppState.facilities.find(f => f.id === facId);
  if (!fac) return;

  if (confirm(`Hapus fasilitas "${fac.title}" dari daftar fasilitas arena?`)) {
    AppState.facilities = AppState.facilities.filter(f => f.id !== facId);
    renderFacilities();
    renderAdminDashboard();
    showToast(`Fasilitas "${fac.title}" berhasil dihapus.`, 'info');
  }
}


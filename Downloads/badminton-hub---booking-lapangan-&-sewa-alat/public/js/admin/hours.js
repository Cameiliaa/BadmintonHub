// ==================== OPERATING HOURS MANAGEMENT ====================
function renderAdminHours() {
  const container = document.getElementById('admin-hours-chips-container');
  if (!container) return;
  container.innerHTML = '';

  AppState.hours.forEach(time => {
    const chip = document.createElement('div');
    chip.className = 'px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 hover:border-slate-300 transition';
    chip.innerHTML = `
      <i data-lucide="clock" class="w-3.5 h-3.5 text-blue-600"></i>
      <span class="font-mono">${time}</span>
      <button onclick="deleteHourSlot('${time}')" class="text-slate-400 hover:text-red-600 p-0.5 rounded transition" title="Hapus Slot Jam">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;
    container.appendChild(chip);
  });
}

function setHourPreset(start, end) {
  document.getElementById('hour-start-val').value = start;
  document.getElementById('hour-end-val').value = end;
}

function openHourModal() {
  document.getElementById('hour-form').reset();
  document.getElementById('hour-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeHourModal() {
  document.getElementById('hour-modal').classList.add('hidden');
}

function saveHourForm(e) {
  e.preventDefault();
  const start = document.getElementById('hour-start-val').value.trim();
  const end = document.getElementById('hour-end-val').value.trim();

  if (!start || !end) {
    showToast('Jam mulai dan jam selesai wajib diisi!', 'error');
    return;
  }

  const slot = `${start} - ${end}`;
  if (AppState.hours.includes(slot)) {
    showToast(`Slot jam ${slot} sudah ada dalam jadwal!`, 'error');
    return;
  }

  AppState.hours.push(slot);
  AppState.hours.sort((a, b) => {
    const aStart = a.split(' - ')[0];
    const bStart = b.split(' - ')[0];
    return aStart.localeCompare(bStart);
  });

  closeHourModal();
  renderScheduleGrid();
  renderAdminDashboard();
  showToast(`Slot jam baru ${slot} berhasil ditambahkan ke semua lapangan!`, 'success');
}

function deleteHourSlot(slotTime) {
  if (AppState.hours.length <= 1) {
    showToast('Minimal harus ada 1 slot jam operasional!', 'error');
    return;
  }

  if (confirm(`Hapus slot jam ${slotTime} dari semua lapangan?`)) {
    AppState.hours = AppState.hours.filter(h => h !== slotTime);
    // Clean cart if slot was selected
    AppState.cart = AppState.cart.filter(item => !(item.type === 'court' && item.time === slotTime));
    updateCartUI();
    renderScheduleGrid();
    renderAdminDashboard();
    showToast(`Slot jam ${slotTime} berhasil dihapus.`, 'info');
  }
}


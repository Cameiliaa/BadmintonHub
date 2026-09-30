// ==================== RESCHEDULE BOOKING LOGIC ====================
function openRescheduleModal(bookingId, courtId = null, dateKey = null, time = null) {
  const b = AppState.adminBookings.find(item => item.id === bookingId);
  if (!b) return;

  AppState.rescheduleTargetBookingId = bookingId;
  const targetSlot = (courtId && dateKey && time) 
    ? { courtId, dateKey, time }
    : (b.courtSlots && b.courtSlots[0]) 
      ? { courtId: b.courtSlots[0].courtId, dateKey: b.courtSlots[0].dateKey, time: b.courtSlots[0].time }
      : null;

  AppState.rescheduleTargetSlot = targetSlot;

  document.getElementById('reschedule-booking-id').innerText = b.id;
  document.getElementById('reschedule-cust-name').innerText = b.name;
  
  const currentSlotLabel = targetSlot 
    ? `${targetSlot.courtId === 'court-1' ? 'Court 1 VIP Indoor' : targetSlot.courtId === 'court-2' ? 'Court 2 Standard Indoor' : 'Court 3 Training Indoor'} · ${targetSlot.dateKey} (${targetSlot.time})`
    : b.details;
  document.getElementById('reschedule-current-slot-info').innerText = currentSlotLabel;

  // Populate Date selector
  const dateSelect = document.getElementById('reschedule-new-date');
  dateSelect.innerHTML = '';
  AppState.dates.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.key;
    opt.innerText = `${d.label} (${d.key})`;
    if (targetSlot && d.key === targetSlot.dateKey) opt.selected = true;
    dateSelect.appendChild(opt);
  });

  // Populate Court selector
  const courtSelect = document.getElementById('reschedule-new-court');
  courtSelect.innerHTML = '';
  AppState.courts.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = `${c.name} (${formatRp(c.basePrice)}/jam)`;
    if (targetSlot && c.id === targetSlot.courtId) opt.selected = true;
    courtSelect.appendChild(opt);
  });

  updateRescheduleAvailableHours();
  document.getElementById('reschedule-reason-input').value = '';
  document.getElementById('admin-reschedule-modal').classList.remove('hidden');
  lucide.createIcons();
}

function updateRescheduleAvailableHours() {
  const dateKey = document.getElementById('reschedule-new-date').value;
  const courtId = document.getElementById('reschedule-new-court').value;
  const hourSelect = document.getElementById('reschedule-new-hour');
  hourSelect.innerHTML = '';

  const bookedInTarget = (AppState.bookedSlots[dateKey] && AppState.bookedSlots[dateKey][courtId]) || [];

  let hasAvailable = false;
  AppState.hours.forEach(h => {
    const isCurrentSlot = AppState.rescheduleTargetSlot && 
                          AppState.rescheduleTargetSlot.dateKey === dateKey && 
                          AppState.rescheduleTargetSlot.courtId === courtId && 
                          AppState.rescheduleTargetSlot.time === h;
    const isTaken = bookedInTarget.includes(h) && !isCurrentSlot;

    const opt = document.createElement('option');
    opt.value = h;
    if (isTaken) {
      opt.disabled = true;
      opt.innerText = `${h} (❌ Sudah Dipesan)`;
    } else {
      opt.innerText = `${h} (🟢 Siap Reschedule)`;
      hasAvailable = true;
    }
    hourSelect.appendChild(opt);
  });

  const submitBtn = document.getElementById('reschedule-submit-btn');
  if (!hasAvailable) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function closeRescheduleModal() {
  document.getElementById('admin-reschedule-modal').classList.add('hidden');
}

function saveRescheduleForm(e) {
  e.preventDefault();
  const bookingId = AppState.rescheduleTargetBookingId;
  const b = AppState.adminBookings.find(item => item.id === bookingId);
  if (!b) return;

  const newDateKey = document.getElementById('reschedule-new-date').value;
  const newCourtId = document.getElementById('reschedule-new-court').value;
  const newHour = document.getElementById('reschedule-new-hour').value;
  const reason = document.getElementById('reschedule-reason-input').value.trim() || 'Permintaan pelanggan.';

  if (!newHour) {
    showToast('Pilih slot jam yang tersedia!', 'error');
    return;
  }

  // 1. Release old slot(s)
  const oldSlot = AppState.rescheduleTargetSlot;
  if (oldSlot && oldSlot.dateKey && oldSlot.courtId && oldSlot.time) {
    if (AppState.bookedSlots[oldSlot.dateKey] && AppState.bookedSlots[oldSlot.dateKey][oldSlot.courtId]) {
      AppState.bookedSlots[oldSlot.dateKey][oldSlot.courtId] = AppState.bookedSlots[oldSlot.dateKey][oldSlot.courtId].filter(t => t !== oldSlot.time);
    }
  } else if (b.courtSlots && b.courtSlots.length > 0) {
    b.courtSlots.forEach(s => {
      if (AppState.bookedSlots[s.dateKey] && AppState.bookedSlots[s.dateKey][s.courtId]) {
        AppState.bookedSlots[s.dateKey][s.courtId] = AppState.bookedSlots[s.dateKey][s.courtId].filter(t => t !== s.time);
      }
    });
  }

  // 2. Book new slot
  if (!AppState.bookedSlots[newDateKey]) AppState.bookedSlots[newDateKey] = {};
  if (!AppState.bookedSlots[newDateKey][newCourtId]) AppState.bookedSlots[newDateKey][newCourtId] = [];
  if (!AppState.bookedSlots[newDateKey][newCourtId].includes(newHour)) {
    AppState.bookedSlots[newDateKey][newCourtId].push(newHour);
  }

  // 3. Update booking record
  const courtObj = AppState.courts.find(c => c.id === newCourtId) || { name: newCourtId, basePrice: 50000 };
  const dateObj = AppState.dates.find(d => d.key === newDateKey) || { label: newDateKey };

  b.courtSlots = [{
    courtId: newCourtId,
    courtName: courtObj.name,
    dateKey: newDateKey,
    dateLabel: dateObj.label,
    time: newHour,
    price: courtObj.basePrice
  }];

  b.details = `${courtObj.name} (${newHour} - ${dateObj.label})`;
  b.adminNote = (b.adminNote ? b.adminNote + ' | ' : '') + `Rescheduled ke ${dateObj.label} ${newHour} (Alasan: ${reason})`;

  closeRescheduleModal();
  renderAdminDashboard();
  renderAdminBookingsTable();
  renderAdminScheduleMatrix();
  renderScheduleGrid();

  showToast(`Jadwal ${b.name} berhasil di-reschedule ke ${dateObj.label} ${newHour}!`, 'success');
}


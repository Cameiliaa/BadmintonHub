// ==================== INTERACTIVE ADMIN SCHEDULE MATRIX ====================
function selectAdminScheduleDate(idx) {
  AppState.adminSelectedDateIndex = idx;
  renderAdminScheduleMatrix();
}

function renderAdminScheduleMatrix() {
  // 1. Date strip selector for Admin
  const dateStrip = document.getElementById('admin-schedule-date-strip');
  if (dateStrip) {
    dateStrip.innerHTML = '';
    AppState.dates.forEach((d, idx) => {
      const isActive = idx === (AppState.adminSelectedDateIndex || 0);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.onclick = () => selectAdminScheduleDate(idx);
      btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        isActive 
          ? 'bg-slate-900 text-white shadow-xs scale-102' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      }`;
      btn.innerText = d.short;
      dateStrip.appendChild(btn);
    });
  }

  // 2. Schedule Grid by Courts
  const container = document.getElementById('admin-schedule-matrix');
  if (!container) return;
  container.innerHTML = '';

  const dateObj = AppState.dates[AppState.adminSelectedDateIndex || 0] || AppState.dates[0];
  const dateKey = dateObj.key;

  AppState.courts.forEach(court => {
    const col = document.createElement('div');
    col.className = `p-4 rounded-2xl bg-slate-50/80 border ${court.isLocked ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'} space-y-3 flex flex-col justify-between`;

    col.innerHTML = `
      <div class="flex items-start justify-between pb-2.5 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full ${court.isLocked ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <h4 class="font-extrabold text-slate-900 text-sm">${court.name}</h4>
          </div>
          <span class="text-[10px] text-slate-500 mt-0.5 block">${court.type}</span>
        </div>
        <div class="text-right">
          <span class="text-xs font-mono font-black text-emerald-700">${formatRp(court.basePrice)}</span>
          <span class="text-[10px] text-slate-400 block font-bold">/ jam</span>
        </div>
      </div>
      <div class="space-y-2 flex-grow" id="admin-court-slots-${court.id}">
      </div>
    `;

    const slotsContainer = col.querySelector(`#admin-court-slots-${court.id}`);

    AppState.hours.forEach(time => {
      if (court.isLocked) {
        const slotEl = document.createElement('div');
        slotEl.className = 'p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between';
        slotEl.innerHTML = `
          <span class="font-mono font-bold">${time}</span>
          <span class="text-[10px] font-bold uppercase bg-amber-200/80 px-2 py-0.5 rounded">Maintenance</span>
        `;
        slotsContainer.appendChild(slotEl);
        return;
      }

      const isBooked = AppState.bookedSlots[dateKey] &&
        AppState.bookedSlots[dateKey][court.id] &&
        AppState.bookedSlots[dateKey][court.id].includes(time);

      if (isBooked) {
        // Find booking details for this slot
        const booking = AppState.adminBookings.find(b => 
          b.status !== 'DITOLAK' && b.status !== 'DIBATALKAN' &&
          b.courtSlots && b.courtSlots.some(s => s.dateKey === dateKey && s.courtId === court.id && s.time === time)
        ) || {
          id: 'BHUB-BOOKED',
          name: 'Pelanggan Terdaftar',
          phone: '-',
          status: 'LUNAS'
        };

        const slotEl = document.createElement('div');
        slotEl.className = 'p-2.5 rounded-xl bg-rose-50/90 border border-rose-200 text-xs space-y-2 shadow-xs';
        slotEl.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-rose-950 flex items-center gap-1 text-[11px]">
              <i data-lucide="clock" class="w-3 h-3 text-rose-600"></i> ${time}
            </span>
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${
              booking.status === 'LUNAS' || booking.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
            }">${booking.status}</span>
          </div>
          <div class="bg-white p-2 rounded-lg border border-rose-100 text-[11px] leading-tight space-y-1">
            <div class="font-bold text-slate-900 flex items-center gap-1">
              <i data-lucide="user" class="w-3 h-3 text-slate-500"></i>
              <span class="truncate">${booking.name}</span>
            </div>
            <div class="text-slate-500 text-[10px] flex items-center justify-between font-mono">
              <span>${booking.phone}</span>
              <span class="text-slate-400 font-bold">${booking.id}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 pt-0.5">
            <button type="button" onclick="openRescheduleModal('${booking.id}', '${court.id}', '${dateKey}', '${time}')" class="flex-1 py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-xs" title="Pindah Jam / Tanggal">
              <i data-lucide="calendar-sync" class="w-3 h-3"></i>
              <span>Reschedule</span>
            </button>
            <button type="button" onclick="confirmCancelSlot('${booking.id}', '${court.id}', '${dateKey}', '${time}')" class="py-1.5 px-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-xs" title="Batalkan Slot Ini">
              <i data-lucide="x" class="w-3 h-3"></i>
              <span>Batal</span>
            </button>
          </div>
        `;
        slotsContainer.appendChild(slotEl);
      } else {
        // Free Available Slot
        const slotEl = document.createElement('div');
        slotEl.className = 'p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between hover:border-emerald-500 transition group';
        slotEl.innerHTML = `
          <div>
            <span class="font-mono font-bold text-slate-700">${time}</span>
            <span class="text-[10px] text-emerald-600 block font-medium">Tersedia</span>
          </div>
          <button type="button" onclick="openManualBookingModal('${court.id}', '${dateKey}', '${time}')" class="px-2.5 py-1 bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 border border-emerald-200 group-hover:border-emerald-600">
            <i data-lucide="plus" class="w-3 h-3"></i>
            <span>Walk-In</span>
          </button>
        `;
        slotsContainer.appendChild(slotEl);
      }
    });

    container.appendChild(col);
  });

  lucide.createIcons();
}


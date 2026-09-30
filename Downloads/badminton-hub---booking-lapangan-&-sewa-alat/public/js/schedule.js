// ==================== DATE SELECTOR ====================
function renderDateSelector() {
  const container = document.getElementById('date-selector-strip');
  container.innerHTML = '';

  AppState.dates.forEach((d, idx) => {
    const isActive = idx === AppState.selectedDateIndex;
    const btn = document.createElement('button');
    btn.onclick = () => selectDate(idx);
    btn.className = `px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
      isActive 
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102' 
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
    }`;
    btn.innerText = d.short;
    container.appendChild(btn);
  });
}

function selectDate(idx) {
  AppState.selectedDateIndex = idx;
  renderDateSelector();
  renderScheduleGrid();
}

// ==================== COURT SCHEDULE GRID ====================
function renderScheduleGrid() {
  const activeDate = AppState.dates[AppState.selectedDateIndex];
  document.getElementById('active-date-display').innerText = `Daftar Lapangan Aktif: ${activeDate.label}`;

  const container = document.getElementById('courts-container');
  container.innerHTML = '';

  const hours = AppState.hours;

  const bookedForDate = AppState.bookedSlots[activeDate.key] || {};
  let totalAvailable = 0;
  let totalBooked = 0;

  AppState.courts.forEach(court => {
    const courtBookedList = bookedForDate[court.id] || [];
    const isCourtMaintenance = court.isLocked;

    const card = document.createElement('div');
    card.className = `bg-white rounded-2xl border ${isCourtMaintenance ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'} p-5 sm:p-6 shadow-xs`;

    // Card Header
    let cardHeaderHtml = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-slate-900">${court.name}</h3>
            <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${
              isCourtMaintenance ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }">
              ${isCourtMaintenance ? 'MAINTENANCE' : court.type}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">${court.spec}</p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 block">Tarif Mulai</span>
          <span class="text-base font-extrabold text-slate-900 font-mono">${formatRp(court.basePrice)}</span>
          <span class="text-[11px] text-slate-400">/ jam</span>
        </div>
      </div>
    `;

    // Hourly Slots Grid
    let slotsHtml = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">`;

    hours.forEach(time => {
      const isBooked = courtBookedList.includes(time);
      const isCartSelected = AppState.cart.some(
        item => item.type === 'court' && item.courtId === court.id && item.time === time && item.dateKey === activeDate.key
      );

      if (isCourtMaintenance) {
        slotsHtml += `
          <div class="p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-center opacity-70 cursor-not-allowed">
            <span class="block text-xs font-semibold">${time}</span>
            <span class="text-[10px] font-bold text-amber-700">Maintenance</span>
          </div>
        `;
      } else if (isBooked) {
        totalBooked++;
        slotsHtml += `
          <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-center cursor-not-allowed select-none">
            <span class="block text-xs font-medium">${time}</span>
            <span class="text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Booked
            </span>
          </div>
        `;
      } else if (isCartSelected) {
        totalAvailable++;
        slotsHtml += `
          <button onclick="toggleSlotSelection('${court.id}', '${time}')" class="p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 text-white text-center shadow-sm font-semibold hover:bg-emerald-700 transition">
            <span class="block text-xs font-bold">${time}</span>
            <span class="text-[10px] text-emerald-100 flex items-center justify-center gap-1 mt-0.5">
              <i data-lucide="check" class="w-3 h-3"></i> Dipilih (${formatRp(court.basePrice)})
            </span>
          </button>
        `;
      } else {
        totalAvailable++;
        slotsHtml += `
          <button onclick="toggleSlotSelection('${court.id}', '${time}')" class="p-2.5 rounded-xl border border-emerald-300 hover:border-emerald-600 hover:bg-emerald-50/70 text-slate-800 text-center transition group">
            <span class="block text-xs font-bold text-slate-800 group-hover:text-emerald-700">${time}</span>
            <span class="text-[10px] font-semibold text-emerald-600 font-mono mt-0.5 block">${formatRp(court.basePrice)}</span>
          </button>
        `;
      }
    });

    slotsHtml += `</div>`;

    card.innerHTML = cardHeaderHtml + slotsHtml;
    container.appendChild(card);
  });

  // Update counters
  document.getElementById('stat-available-slots').innerText = `Tersedia: ${totalAvailable} Slot`;
  document.getElementById('stat-booked-slots').innerText = `Terisi: ${totalBooked} Slot`;

  lucide.createIcons();
}

// Toggle Court Slot into Shopping Cart
function toggleSlotSelection(courtId, time) {
  const activeDate = AppState.dates[AppState.selectedDateIndex];
  const court = AppState.courts.find(c => c.id === courtId);
  if (!court) return;

  const existingIndex = AppState.cart.findIndex(
    item => item.type === 'court' && item.courtId === courtId && item.time === time && item.dateKey === activeDate.key
  );

  if (existingIndex > -1) {
    AppState.cart.splice(existingIndex, 1);
    showToast(`Slot ${time} di ${court.name} dibatalkan.`);
  } else {
    AppState.cart.push({
      id: `court-${courtId}-${activeDate.key}-${time}`,
      type: 'court',
      courtId: court.id,
      courtName: court.name,
      dateKey: activeDate.key,
      dateLabel: activeDate.label,
      time: time,
      price: court.basePrice,
      qty: 1
    });
    showToast(`Slot ${time} ditambahkan ke Keranjang!`);
  }

  updateCartUI();
  renderScheduleGrid();
}


// Manual cashier booking: one customer, consecutive court slots and optional products.
function manualDurationLabel(hours) {
  const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const total = hours.reduce((sum, hour) => {
    const [start, end] = hour.split(' - ');
    return sum + minutes(end) - minutes(start);
  }, 0);
  return `${Number((total / 60).toFixed(2)).toLocaleString('id-ID')} jam`;
}
function getManualConsecutiveHours(dateKey, courtId, start) {
  const court = AppState.courts.find(c => c.id === courtId);
  if (!court || court.isLocked || !AppState.dates.some(d => d.key === dateKey)) return [];
  const taken = AppState.bookedSlots[dateKey]?.[courtId] || [];
  const hours = [...AppState.hours].sort();
  const index = hours.indexOf(start);
  if (index < 0) return [];
  const result = [];
  for (const hour of hours.slice(index)) {
    if (taken.includes(hour)) break;
    if (result.length && result.at(-1).split(' - ')[1] !== hour.split(' - ')[0]) break;
    result.push(hour);
  }
  return result;
}

function calculateManualBooking(dateKey, courtId, start, count, quantities) {
  const available = getManualConsecutiveHours(dateKey, courtId, start);
  if (!Number.isInteger(count) || count < 1 || count > available.length) {
    throw new Error('Pilih durasi yang tersedia. Slot mungkin sudah terisi atau lapangan dikunci.');
  }
  const court = AppState.courts.find(c => c.id === courtId);
  const date = AppState.dates.find(d => d.key === dateKey);
  const slots = available.slice(0, count).map(time => ({
    courtId, courtName: court.name, dateKey, dateLabel: date.label, time, price: court.basePrice
  }));
  const addons = quantities.flatMap(({ productId, qty }) => {
    if (!Number.isInteger(qty) || qty < 0 || qty > 999) throw new Error('Jumlah produk harus bilangan bulat antara 0 dan 999.');
    if (!qty) return [];
    const product = AppState.products.find(p => p.id === productId);
    if (!product) throw new Error('Produk tidak tersedia. Buka ulang formulir booking.');
    return [{ productId, name: product.name, qty, price: product.price }];
  });
  const courtTotal = slots.reduce((sum, slot) => sum + slot.price, 0);
  const productTotal = addons.reduce((sum, item) => sum + item.qty * item.price, 0);
  return { slots, addons, courtTotal, productTotal, total: courtTotal + productTotal };
}

function openManualBookingModal(prefilledCourtId = null, prefilledDateKey = null, prefilledHour = null) {
  document.getElementById('manual-booking-form').reset();
  const populate = (id, items, selected, value, label) => {
    const select = document.getElementById(id);
    select.replaceChildren();
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = value(item);
      option.textContent = label(item);
      option.selected = value(item) === selected;
      select.appendChild(option);
    });
    if (select.selectedIndex < 0 && select.options.length) select.selectedIndex = 0;
  };
  populate('manual-booking-date', AppState.dates, prefilledDateKey, d => d.key, d => `${d.label} (${d.key})`);
  populate('manual-booking-court', AppState.courts.filter(c => !c.isLocked), prefilledCourtId, c => c.id, c => `${c.name} (${formatRp(c.basePrice)}/jam)`);
  const products = document.getElementById('manual-booking-products');
  products.replaceChildren();
  AppState.products.forEach((product, index) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3';
    const label = document.createElement('label');
    label.htmlFor = `manual-product-${index}`;
    label.textContent = `${product.name} — ${formatRp(product.price)} / ${product.unit}`;
    const input = document.createElement('input');
    input.id = label.htmlFor;
    input.type = 'number';
    input.min = '0'; input.max = '999'; input.step = '1'; input.value = '0';
    input.dataset.productId = product.id;
    input.className = 'w-20 shrink-0 rounded-xl border border-slate-300 p-2';
    input.addEventListener('input', updateManualBookingSummary);
    row.append(label, input);
    products.appendChild(row);
  });
  if (!AppState.products.length) products.textContent = 'Belum ada produk tambahan.';
  updateManualBookingAvailableHours(prefilledHour);
  document.getElementById('admin-manual-booking-modal').classList.remove('hidden');
  lucide.createIcons();
}

function updateManualBookingAvailableHours(preselectedHour = null) {
  const dateKey = document.getElementById('manual-booking-date').value;
  const courtId = document.getElementById('manual-booking-court').value;
  const select = document.getElementById('manual-booking-hour');
  select.replaceChildren();
  [...AppState.hours].sort().forEach(hour => {
    const option = document.createElement('option');
    option.value = hour;
    option.disabled = !getManualConsecutiveHours(dateKey, courtId, hour).length;
    option.textContent = `${hour.split(' - ')[0]}${option.disabled ? ' (Tidak tersedia)' : ''}`;
    select.appendChild(option);
  });
  const available = [...select.options].filter(option => !option.disabled);
  select.value = available.find(option => option.value === preselectedHour)?.value || available[0]?.value || '';
  updateManualBookingDurations(false);
}

function updateManualBookingDurations(preserve = true) {
  const select = document.getElementById('manual-booking-duration');
  const previous = preserve ? Number(select.value) : 1;
  const hours = getManualConsecutiveHours(
    document.getElementById('manual-booking-date').value,
    document.getElementById('manual-booking-court').value,
    document.getElementById('manual-booking-hour').value
  );
  select.replaceChildren();
  hours.forEach((hour, index) => {
    const option = document.createElement('option');
    option.value = String(index + 1);
    option.textContent = `${manualDurationLabel(hours.slice(0, index + 1))} · selesai ${hour.split(' - ')[1]}`;
    select.appendChild(option);
  });
  if (hours.length) select.value = String(Math.min(previous || 1, hours.length));
  updateManualBookingSummary();
}

function readManualBookingQuote() {
  return calculateManualBooking(
    document.getElementById('manual-booking-date').value,
    document.getElementById('manual-booking-court').value,
    document.getElementById('manual-booking-hour').value,
    Number(document.getElementById('manual-booking-duration').value),
    [...document.querySelectorAll('#manual-booking-products input')].map(input => ({ productId: input.dataset.productId, qty: Number(input.value) }))
  );
}

function updateManualBookingSummary() {
  const summary = document.getElementById('manual-booking-summary');
  const button = document.getElementById('manual-booking-submit-btn');
  try {
    const quote = readManualBookingQuote();
    summary.textContent = `${manualDurationLabel(quote.slots.map(slot => slot.time))}: ${quote.slots[0].time.split(' - ')[0]} – ${quote.slots.at(-1).time.split(' - ')[1]}\nLapangan: ${formatRp(quote.courtTotal)}\nTambahan: ${formatRp(quote.productTotal)}\nTotal pembayaran: ${formatRp(quote.total)}`;
    button.disabled = false;
  } catch (error) {
    summary.textContent = error.message;
    button.disabled = true;
  }
  button.classList.toggle('opacity-50', button.disabled);
  button.classList.toggle('cursor-not-allowed', button.disabled);
}

function closeManualBookingModal() {
  document.getElementById('admin-manual-booking-modal').classList.add('hidden');
}

function saveManualBookingForm(e) {
  e.preventDefault();
  const value = id => document.getElementById(id).value.trim();
  const name = value('manual-cust-name'), phone = value('manual-cust-phone');
  if (!name || !phone) return showToast('Mohon lengkapi nama dan WhatsApp!', 'error');
  let quote;
  try { quote = readManualBookingQuote(); }
  catch (error) { showToast(error.message, 'error'); updateManualBookingSummary(); return; }
  const payMethod = value('manual-pay-method');
  const first = quote.slots[0];
  const details = [
    `${first.courtName} (${first.dateLabel}, ${first.time.split(' - ')[0]} – ${quote.slots.at(-1).time.split(' - ')[1]}) · ${manualDurationLabel(quote.slots.map(slot => slot.time))}`,
    ...quote.addons.map(item => `${item.name} (${item.qty}x)`), `Manual ${payMethod}`
  ].join(' · ');
  // Validate the entire order before reserving any slot.
  if (!AppState.bookedSlots[first.dateKey]) AppState.bookedSlots[first.dateKey] = {};
  if (!AppState.bookedSlots[first.dateKey][first.courtId]) AppState.bookedSlots[first.dateKey][first.courtId] = [];
  AppState.bookedSlots[first.dateKey][first.courtId].push(...quote.slots.map(slot => slot.time));
  AppState.adminBookings.unshift({
    id: 'BHUB-MANUAL-' + crypto.randomUUID(), name, phone,
    email: value('manual-cust-email') || 'walkin@badmintonhub.id', details,
    courtSlots: quote.slots, addons: quote.addons, total: quote.total,
    proofUploaded: true, proofFileName: 'manual_cashier_entry.jpg',
    status: value('manual-pay-status'), paymentMethod: payMethod,
    adminNote: `Booking Manual via ${payMethod}${value('manual-booking-note') ? ': ' + value('manual-booking-note') : ''}`,
    timestamp: new Date().toLocaleString('id-ID')
  });
  closeManualBookingModal();
  renderAdminDashboard();
  renderScheduleGrid();
  showToast(`Booking manual ${manualDurationLabel(quote.slots.map(slot => slot.time))} berhasil dibuat dalam satu pesanan.`, 'success');
}

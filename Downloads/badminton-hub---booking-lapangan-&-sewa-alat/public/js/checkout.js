// ==================== CHECKOUT & QRIS MODAL ====================
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast('Keranjang Anda masih kosong!', 'error');
    return;
  }
  toggleCartDrawer(false);

  // Compute total
  let subtotal = AppState.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  let courtSlots = AppState.cart.filter(i => i.type === 'court').reduce((s, i) => s + i.qty, 0);
  let discount = courtSlots >= 2 ? Math.round(subtotal * 0.1) : 0;
  let grandTotal = subtotal - discount;

  document.getElementById('modal-bill-amount').innerText = formatRp(grandTotal);
  document.getElementById('checkout-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function simulateCopyTotal() {
  const amountText = document.getElementById('modal-bill-amount').innerText;
  navigator.clipboard?.writeText(amountText);
  showToast(`Nominal ${amountText} berhasil disalin!`);
}

function handleProofUpload(e) {
  const file = e.target.files[0];
  if (file) {
    AppState.uploadedProofData = file.name;
    document.getElementById('proof-filename').innerText = file.name;
    document.getElementById('proof-preview-container').classList.remove('hidden');
    showToast('Bukti transfer terpilih.');
    lucide.createIcons();
  }
}

function simulateAutoProof() {
  AppState.uploadedProofData = 'struk_qris_sukses_' + Date.now() + '.jpg';
  document.getElementById('proof-filename').innerText = AppState.uploadedProofData;
  document.getElementById('proof-preview-container').classList.remove('hidden');
  showToast('Simulasi bukti pembayaran siap.');
  lucide.createIcons();
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const email = document.getElementById('cust-email').value.trim();

  if (!name || !phone || !email) {
    showToast('Mohon lengkapi Nama, WhatsApp, dan ALAMAT EMAIL Anda!', 'error');
    return;
  }

  // Calculate totals
  let subtotal = AppState.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  let courtSlots = AppState.cart.filter(i => i.type === 'court').reduce((s, i) => s + i.qty, 0);
  let discount = courtSlots >= 2 ? Math.round(subtotal * 0.1) : 0;
  let grandTotal = subtotal - discount;

  const bookingId = 'BHUB-2026-' + Math.floor(1000 + Math.random() * 9000);

  // Detail item description and structured slots
  const courtSlotsArray = [];
  const addonsArray = [];

  AppState.cart.forEach(item => {
    if (item.type === 'court') {
      courtSlotsArray.push({
        courtId: item.courtId,
        courtName: item.courtName,
        dateKey: item.dateKey,
        dateLabel: item.dateLabel,
        time: item.time,
        price: item.price
      });

      // Add to booked slots registry
      if (!AppState.bookedSlots[item.dateKey]) {
        AppState.bookedSlots[item.dateKey] = {};
      }
      if (!AppState.bookedSlots[item.dateKey][item.courtId]) {
        AppState.bookedSlots[item.dateKey][item.courtId] = [];
      }
      if (!AppState.bookedSlots[item.dateKey][item.courtId].includes(item.time)) {
        AppState.bookedSlots[item.dateKey][item.courtId].push(item.time);
      }
    } else {
      addonsArray.push({
        name: item.name,
        qty: item.qty,
        price: item.price
      });
    }
  });

  const itemDetailsSummary = AppState.cart.map(item => {
    if (item.type === 'court') {
      return `${item.courtName} (${item.time} - ${item.dateLabel})`;
    }
    return `${item.name} (${item.qty}x)`;
  }).join(' · ');

  const newBooking = {
    id: bookingId,
    name: name,
    phone: phone,
    email: email,
    details: itemDetailsSummary,
    courtSlots: courtSlotsArray,
    addons: addonsArray,
    total: grandTotal,
    proofUploaded: true,
    proofFileName: AppState.uploadedProofData || 'struk_transfer_qris.jpg',
    status: 'Menunggu Verifikasi',
    adminNote: '',
    timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    receiptData: {
      refId: 'QRIS-BCA-' + Math.floor(1000000 + Math.random() * 9000000),
      sender: name,
      bank: 'BCA Mobile / QRIS',
      amount: grandTotal
    }
  };

  // Push to Admin Verification queue
  AppState.adminBookings.unshift(newBooking);
  AppState.latestCustomerBookingId = bookingId;

  // Show Nav Ticket button
  const navTicketBtn = document.getElementById('my-ticket-nav-btn');
  if (navTicketBtn) navTicketBtn.classList.remove('hidden');

  // Clear cart
  AppState.cart = [];
  updateCartUI();
  renderScheduleGrid();

  // Close checkout modal & open ticket modal
  closeCheckoutModal();
  openTicketModalForBooking(newBooking);

  showToast('Pesanan berhasil dibuat! E-tiket telah terbit.', 'success');
}


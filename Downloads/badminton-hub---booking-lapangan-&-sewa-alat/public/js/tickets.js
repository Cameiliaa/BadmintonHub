// ==================== DIGITAL TICKET FUNCTIONS ====================
function openTicketModalForBooking(booking) {
  if (!booking) return;

  document.getElementById('ticket-booking-id').innerText = booking.id;
  document.getElementById('ticket-cust-name').innerText = booking.name;
  document.getElementById('ticket-cust-phone').innerText = booking.phone;
  document.getElementById('ticket-cust-email').innerText = booking.email;
  document.getElementById('ticket-total-paid').innerText = formatRp(booking.total);

  // Render Itemized breakdown
  const ticketItemsList = document.getElementById('ticket-items-list');
  ticketItemsList.innerHTML = '';

  if (booking.courtSlots && booking.courtSlots.length > 0) {
    booking.courtSlots.forEach(slot => {
      ticketItemsList.innerHTML += `
        <div class="flex justify-between text-[11px] text-slate-800">
          <span>🏸 ${slot.courtName} (${slot.time})</span>
          <span class="font-mono">${formatRp(slot.price)}</span>
        </div>
      `;
    });
  }

  if (booking.addons && booking.addons.length > 0) {
    booking.addons.forEach(ad => {
      ticketItemsList.innerHTML += `
        <div class="flex justify-between text-[11px] text-slate-800">
          <span>📦 ${ad.name} (${ad.qty}x)</span>
          <span class="font-mono">${formatRp(ad.price * ad.qty)}</span>
        </div>
      `;
    });
  }

  if ((!booking.courtSlots || booking.courtSlots.length === 0) && (!booking.addons || booking.addons.length === 0)) {
    ticketItemsList.innerHTML = `<div class="text-[11px] text-slate-700">${booking.details}</div>`;
  }

  // Live Status Styling
  const statusBadge = document.getElementById('ticket-status-badge');
  const statusContainer = document.getElementById('ticket-status-container');
  const statusDot = document.getElementById('ticket-status-dot');

  if (booking.status === 'LUNAS' || booking.status === 'Disetujui') {
    statusBadge.className = 'font-extrabold px-2.5 py-0.5 rounded bg-emerald-200 text-emerald-950 uppercase text-[10px] tracking-wide';
    statusBadge.innerText = 'LUNAS / TERVERIFIKASI';
    statusContainer.className = 'p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-emerald-900';
    statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
  } else if (booking.status === 'DITOLAK') {
    statusBadge.className = 'font-extrabold px-2.5 py-0.5 rounded bg-red-200 text-red-950 uppercase text-[10px] tracking-wide';
    statusBadge.innerText = 'DITOLAK';
    statusContainer.className = 'p-3 rounded-xl bg-red-50 border border-red-300 flex items-center justify-between text-red-900';
    statusDot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
  } else {
    statusBadge.className = 'font-extrabold px-2.5 py-0.5 rounded bg-amber-200/80 text-amber-950 uppercase text-[10px] tracking-wide';
    statusBadge.innerText = 'PENDING VERIFICATION';
    statusContainer.className = 'p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900';
    statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping';
  }

  // Dynamic Admin Note Box
  const noteBox = document.getElementById('ticket-admin-note-box');
  const noteText = document.getElementById('ticket-admin-note-text');
  const noteTitle = document.getElementById('ticket-admin-note-title');

  if (booking.adminNote && booking.adminNote.trim() !== '') {
    noteBox.classList.remove('hidden');
    noteText.innerText = booking.adminNote;
    if (booking.status === 'DITOLAK') {
      noteBox.className = 'p-3.5 rounded-xl border bg-red-50 border-red-200 text-red-950 text-xs';
      noteTitle.innerText = 'Alasan Penolakan dari Admin:';
    } else {
      noteBox.className = 'p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs';
      noteTitle.innerText = 'Catatan Pengelola Arena:';
    }
  } else {
    noteBox.classList.add('hidden');
  }

  document.getElementById('ticket-modal').classList.remove('hidden');
  lucide.createIcons();
}

function openLatestTicketModal() {
  const b = AppState.adminBookings.find(item => item.id === AppState.latestCustomerBookingId) || AppState.adminBookings[0];
  if (b) {
    openTicketModalForBooking(b);
  } else {
    showToast('Belum ada pesanan aktif.', 'info');
  }
}

function closeTicketModal() {
  document.getElementById('ticket-modal').classList.add('hidden');
}

// PDF Download via html2pdf with fallback to window.print()
function downloadTicketPDF() {
  const element = document.getElementById('printable-ticket-content');
  const bookingId = document.getElementById('ticket-booking-id').innerText || 'BHUB-PASS';

  showToast('Menyiapkan file PDF tiket resmi...', 'info');

  if (window.html2pdf) {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `Tiket-BadmintonHub-${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      showToast('Tiket PDF berhasil diunduh!', 'success');
    }).catch(err => {
      console.warn('html2pdf fallback to print dialog', err);
      window.print();
    });
  } else {
    window.print();
  }
}


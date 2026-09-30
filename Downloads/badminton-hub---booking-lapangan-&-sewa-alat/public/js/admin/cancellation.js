// ==================== CANCELLATION LOGIC ====================
function confirmCancelBooking(bookingId) {
  const b = AppState.adminBookings.find(item => item.id === bookingId);
  if (!b) return;

  const reason = prompt(`Batalkan booking ${b.id} (${b.name})?\nSlot lapangan akan langsung kembali dibuka untuk penyewa lain.\n\nMasukkan alasan pembatalan:`, 'Permintaan pembatalan dari pelanggan');
  if (reason === null) return; // user cancelled prompt

  b.status = 'DIBATALKAN';
  b.adminNote = (b.adminNote ? b.adminNote + ' | ' : '') + `Dibatalkan oleh Admin: ${reason || 'Permintaan pelanggan'}`;

  // Free all court slots of this booking
  if (b.courtSlots && b.courtSlots.length > 0) {
    b.courtSlots.forEach(s => {
      if (AppState.bookedSlots[s.dateKey] && AppState.bookedSlots[s.dateKey][s.courtId]) {
        AppState.bookedSlots[s.dateKey][s.courtId] = AppState.bookedSlots[s.dateKey][s.courtId].filter(t => t !== s.time);
      }
    });
  }

  renderAdminDashboard();
  renderAdminBookingsTable();
  renderAdminScheduleMatrix();
  renderScheduleGrid();

  showToast(`Booking ${b.id} dibatalkan. Slot lapangan kembali tersedia!`, 'info');
}

function confirmCancelSlot(bookingId, courtId, dateKey, slotTime) {
  const b = AppState.adminBookings.find(item => item.id === bookingId);
  if (!b) {
    if (AppState.bookedSlots[dateKey] && AppState.bookedSlots[dateKey][courtId]) {
      AppState.bookedSlots[dateKey][courtId] = AppState.bookedSlots[dateKey][courtId].filter(t => t !== slotTime);
      renderAdminScheduleMatrix();
      renderScheduleGrid();
      showToast(`Slot jam ${slotTime} berhasil dibatalkan dan dibuka kembali.`, 'info');
    }
    return;
  }
  confirmCancelBooking(bookingId);
}


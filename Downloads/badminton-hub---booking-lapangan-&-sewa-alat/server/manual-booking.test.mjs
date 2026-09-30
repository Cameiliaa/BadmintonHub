import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

function fixture() {
  const state = { courts: [{ id: 'c1', name: 'Court', basePrice: 50000 }], dates: [{ key: 'day', label: 'Today' }],
    hours: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '12:00 - 13:00'],
    bookedSlots: {}, adminBookings: [], products: [{ id: 'racket', name: 'Raket', price: 15000 }, { id: 'ball', name: 'Shuttlecock', price: 90000 }] };
  const context = createContext({ AppState: state });
  runInContext(readFileSync('public/js/admin/manual-booking.js', 'utf8'), context);
  return { state, context };
}
test('two hours and additional products produce one correctly priced order', () => {
  const { context } = fixture();
  const quote = context.calculateManualBooking('day', 'c1', '08:00 - 09:00', 2, [{ productId: 'racket', qty: 2 }, { productId: 'ball', qty: 1 }]);
  assert.equal(quote.slots.length, 2);
  assert.equal(quote.addons.length, 2);
  assert.equal(quote.courtTotal, 100000);
  assert.equal(quote.productTotal, 120000);
  assert.equal(quote.total, 220000);
  assert.equal(context.manualDurationLabel(['08:00 - 09:00', '09:00 - 10:00']), '2 jam');
  assert.equal(context.manualDurationLabel(['08:00 - 08:30']), '0,5 jam');
});
test('save reserves every selected slot and stores products in one booking', () => {
  const { state, context } = fixture();
  const fields = { 'manual-cust-name': 'Pelanggan', 'manual-cust-phone': '0812345678', 'manual-cust-email': '', 'manual-pay-method': 'Tunai di Kasir', 'manual-pay-status': 'LUNAS', 'manual-booking-note': '' };
  context.document = { getElementById: id => ({ value: fields[id] }) };
  context.crypto = { randomUUID: () => 'test-id' };
  for (const name of ['closeManualBookingModal', 'renderAdminDashboard', 'renderScheduleGrid', 'showToast']) context[name] = () => {};
  context.readManualBookingQuote = () => context.calculateManualBooking('day', 'c1', '08:00 - 09:00', 2, [{ productId: 'racket', qty: 2 }]);
  context.saveManualBookingForm({ preventDefault() {} });
  assert.equal(state.adminBookings.length, 1);
  assert.equal(state.adminBookings[0].courtSlots.length, 2);
  assert.equal(state.adminBookings[0].addons[0].qty, 2);
  assert.equal(state.adminBookings[0].total, 130000);
  assert.equal(state.bookedSlots.day.c1.length, 2);
});
test('booked slots, gaps, invalid durations, locked courts and invalid products are rejected without mutation', () => {
  const { state, context } = fixture();
  const quote = (count, products = []) => context.calculateManualBooking('day', 'c1', '08:00 - 09:00', count, products);
  assert.throws(() => quote(4)); // Gap at 11:00.
  for (const count of [0, -1, 1.5, NaN]) assert.throws(() => quote(count));
  for (const qty of [-1, 0.5, NaN, 1000]) assert.throws(() => quote(1, [{ productId: 'racket', qty }]));
  assert.throws(() => quote(1, [{ productId: 'deleted', qty: 1 }]));
  state.bookedSlots.day = { c1: ['09:00 - 10:00'] };
  assert.throws(() => quote(2));
  assert.equal(quote(1).total, 50000);
  state.courts[0].isLocked = true;
  assert.throws(() => quote(1));
  assert.equal(state.bookedSlots.day.c1.length, 1);
  assert.equal(state.adminBookings.length, 0);
});

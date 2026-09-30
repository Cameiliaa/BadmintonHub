// ==================== CART DRAWER & STATE ====================
function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (open) {
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
  } else {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleCartDrawer(false);
  }
});

function updateCartUI() {
  const totalCount = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const deskCounter = document.getElementById('cart-counter');
  if (deskCounter) deskCounter.innerText = totalCount;
  const mobCounter = document.getElementById('mobile-cart-counter');
  if (mobCounter) mobCounter.innerText = totalCount;
  const drawerSub = document.getElementById('cart-drawer-subtitle');
  if (drawerSub) drawerSub.innerText = `${totalCount} item dalam keranjang`;

  const listContainer = document.getElementById('cart-items-container');
  listContainer.innerHTML = '';

  if (AppState.cart.length === 0) {
    listContainer.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <i data-lucide="shopping-bag" class="w-7 h-7"></i>
        </div>
        <h4 class="font-bold text-slate-700 text-sm">Keranjang Anda Kosong</h4>
        <p class="text-xs text-slate-500 mt-1">Pilih slot jadwal lapangan atau sewa raket untuk mulai.</p>
        <a href="#jadwal" onclick="toggleCartDrawer(false)" class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
          Pilih Lapangan
        </a>
      </div>
    `;
    document.getElementById('cart-subtotal-val').innerText = 'Rp 0';
    document.getElementById('cart-discount-row').classList.add('hidden');
    document.getElementById('cart-grandtotal-val').innerText = 'Rp 0';
    document.getElementById('cart-checkout-btn').disabled = true;
    document.getElementById('cart-checkout-btn').classList.add('opacity-50', 'cursor-not-allowed');
    lucide.createIcons();
    return;
  }

  document.getElementById('cart-checkout-btn').disabled = false;
  document.getElementById('cart-checkout-btn').classList.remove('opacity-50', 'cursor-not-allowed');

  let subtotal = 0;
  let courtSlotsCount = 0;

  AppState.cart.forEach((item, idx) => {
    const itemSubtotal = item.price * item.qty;
    subtotal += itemSubtotal;
    if (item.type === 'court') courtSlotsCount += item.qty;

    const el = document.createElement('div');
    el.className = 'p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs';

    if (item.type === 'court') {
      el.innerHTML = `
        <div class="flex-grow">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-900">${item.courtName}</span>
            <span class="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">Lapangan</span>
          </div>
          <p class="text-slate-500 text-[11px] mt-0.5">${item.dateLabel} · <span class="font-bold text-slate-700">${item.time}</span></p>
          <div class="text-emerald-700 font-bold font-mono mt-1">${formatRp(item.price)}</div>
        </div>
        <button onclick="removeCartItem(${idx})" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      `;
    } else {
      el.innerHTML = `
        <div class="flex-grow">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-900">${item.name}</span>
            <span class="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">Add-on</span>
          </div>
          <div class="text-emerald-700 font-bold font-mono mt-0.5">${formatRp(item.price)}</div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="changeQty(${idx}, -1)" class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100">-</button>
          <span class="w-5 text-center font-bold text-slate-800">${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)" class="w-6 h-6 rounded bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100">+</button>
          <button onclick="removeCartItem(${idx})" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition ml-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }

    listContainer.appendChild(el);
  });

  // Promo discount calculation: 10% if 2 or more court slots are booked!
  let discount = 0;
  if (courtSlotsCount >= 2) {
    discount = Math.round(subtotal * 0.1);
    document.getElementById('cart-discount-row').classList.remove('hidden');
    document.getElementById('cart-discount-val').innerText = `- ${formatRp(discount)}`;
    document.getElementById('promo-notice-text').innerText = '🎉 Diskon 10% aktif untuk booking 2 slot atau lebih!';
  } else {
    document.getElementById('cart-discount-row').classList.add('hidden');
    document.getElementById('promo-notice-text').innerText = 'Booking minimal 2 jam untuk mendapatkan diskon 10%!';
  }

  const grandTotal = subtotal - discount;

  document.getElementById('cart-subtotal-val').innerText = formatRp(subtotal);
  document.getElementById('cart-grandtotal-val').innerText = formatRp(grandTotal);

  lucide.createIcons();
}

function removeCartItem(index) {
  AppState.cart.splice(index, 1);
  updateCartUI();
  renderScheduleGrid();
}

function changeQty(index, delta) {
  const item = AppState.cart[index];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart.splice(index, 1);
  }
  updateCartUI();
}

function clearCart() {
  if (confirm('Kosongkan semua pesanan di keranjang?')) {
    AppState.cart = [];
    updateCartUI();
    renderScheduleGrid();
    showToast('Keranjang telah dikosongkan.');
  }
}


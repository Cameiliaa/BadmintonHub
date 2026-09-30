// ==================== STORE SECTION ====================
function renderStoreProducts() {
  const container = document.getElementById('store-products-grid');
  container.innerHTML = '';

  AppState.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group';

    const priceDisplay = p.price;
    const unitDisplay = p.unit || 'unit';

    card.innerHTML = `
      <div class="h-48 overflow-hidden bg-slate-100 relative">
        <img 
          src="${p.image}" 
          alt="${p.name}" 
          class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          onerror="this.onerror=null; this.src='https://placehold.co/400x300/10b981/ffffff?text=${encodeURIComponent(p.name)}';"
        />
        <span class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
          Ready Stock
        </span>
      </div>
      <div class="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <h3 class="font-bold text-slate-900 text-base leading-snug">${p.name}</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">${p.desc}</p>
        </div>
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="text-base font-extrabold text-emerald-600 font-mono">${formatRp(priceDisplay)}</span>
            <span class="text-[10px] text-slate-400 block">/ ${unitDisplay}</span>
          </div>
          <button onclick="addProductToCart('${p.id}')" class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Tambah</span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function addProductToCart(prodId) {
  const product = AppState.products.find(p => p.id === prodId);
  if (!product) return;

  const price = product.price;
  const existing = AppState.cart.find(item => item.type === 'product' && item.productId === prodId);

  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({
      id: `prod-${prodId}-${Date.now()}`,
      type: 'product',
      productId: prodId,
      name: product.name,
      price: price,
      qty: 1
    });
  }

  showToast(`${product.name} dimasukkan ke Keranjang.`);
  updateCartUI();
}


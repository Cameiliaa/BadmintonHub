// ==================== EQUIPMENT & PRODUCTS MANAGEMENT ====================
function renderAdminProducts() {
  const container = document.getElementById('admin-products-cards-container');
  if (!container) return;
  container.innerHTML = '';

  AppState.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition';

    card.innerHTML = `
      <div class="flex gap-4">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='/images/badminton_racket_pro_1790574262416.jpg';" />
        </div>
        <div class="flex-grow">
          <h4 class="font-extrabold text-slate-900 text-sm leading-snug">${p.name}</h4>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${p.desc}</p>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="text-base font-black text-emerald-600 font-mono">${formatRp(p.price)}</span>
            <span class="text-[11px] text-slate-400">/ ${p.unit}</span>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button onclick="openProductModal('${p.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
          <span>Edit Harga & Info</span>
        </button>
        <button onclick="deleteProduct('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus Produk">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openProductModal(prodId = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const idInput = document.getElementById('prod-form-id');
  const nameInput = document.getElementById('prod-form-name');
  const priceInput = document.getElementById('prod-form-price');
  const unitInput = document.getElementById('prod-form-unit');
  const descInput = document.getElementById('prod-form-desc');
  const imageInput = document.getElementById('prod-form-image');

  if (prodId) {
    const prod = AppState.products.find(p => p.id === prodId);
    if (!prod) return;
    title.innerText = 'Edit Barang: ' + prod.name;
    idInput.value = prod.id;
    nameInput.value = prod.name;
    priceInput.value = prod.price;
    unitInput.value = prod.unit;
    descInput.value = prod.desc;
    imageInput.value = prod.image;
  } else {
    title.innerText = 'Tambah Barang Sewa / Kafe Baru';
    idInput.value = '';
    nameInput.value = '';
    priceInput.value = 20000;
    unitInput.value = 'unit / sesi';
    descInput.value = 'Perlengkapan berkualitas tinggi siap pakai di arena.';
    imageInput.value = '/images/badminton_racket_pro_1790574262416.jpg';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function setProductImagePreset(url) {
  document.getElementById('prod-form-image').value = url;
}

function saveProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('prod-form-id').value;
  const name = document.getElementById('prod-form-name').value.trim();
  const price = parseInt(document.getElementById('prod-form-price').value, 10) || 10000;
  const unit = document.getElementById('prod-form-unit').value.trim() || 'unit';
  const desc = document.getElementById('prod-form-desc').value.trim();
  const image = document.getElementById('prod-form-image').value.trim() || '/images/badminton_racket_pro_1790574262416.jpg';

  if (!name) {
    showToast('Nama produk wajib diisi!', 'error');
    return;
  }

  if (id) {
    const prod = AppState.products.find(p => p.id === id);
    if (prod) {
      prod.name = name;
      prod.price = price;
      prod.unit = unit;
      prod.desc = desc;
      prod.image = image;
      showToast(`Barang ${name} berhasil diperbarui dengan harga ${formatRp(price)}!`, 'success');
    }
  } else {
    const newId = 'prod-' + Date.now();
    AppState.products.push({
      id: newId,
      name: name,
      price: price,
      unit: unit,
      desc: desc,
      image: image
    });
    showToast(`Produk baru ${name} (${formatRp(price)}) berhasil ditambahkan ke katalog!`, 'success');
  }

  closeProductModal();
  renderStoreProducts();
  renderAdminDashboard();
}

function deleteProduct(prodId) {
  if (AppState.products.length <= 1) {
    showToast('Minimal harus ada 1 barang dalam katalog!', 'error');
    return;
  }

  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  if (confirm(`Hapus ${prod.name} dari katalog toko arena?`)) {
    AppState.products = AppState.products.filter(p => p.id !== prodId);
    // Remove from cart if any
    AppState.cart = AppState.cart.filter(item => item.productId !== prodId);
    updateCartUI();
    renderStoreProducts();
    renderAdminDashboard();
    showToast(`${prod.name} berhasil dihapus dari katalog.`, 'info');
  }
}


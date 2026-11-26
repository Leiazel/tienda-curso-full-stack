'use strict';

// ==========================================================================
// DICH® / L&D STREETWEAR — FRONTEND CONNECTED TO EXPRESS + MYSQL REST API
// ==========================================================================

const API_BASE_URL = (() => {
  if (typeof window !== 'undefined' && window.API_BASE_URL) {
    return String(window.API_BASE_URL).replace(/\/+$/, '');
  }
  const { protocol, origin, port } = window.location;
  const staticDevPorts = ['5500', '5501', '5173', '8080'];
  if (protocol.startsWith('http') && origin !== 'null' && !staticDevPorts.includes(port)) {
    return '';
  }
  return 'http://localhost:3000';
})();

const CART_STORAGE_KEY = 'ld_store_cart_v1';

// Fallback catalog used only if the API / MySQL database is unreachable
const FALLBACK_PRODUCTS = [
  {
    id: 'ld-hoodie-01',
    slug: 'ld-hoodie-01',
    badge: 'AVAILABLE 28/250',
    name: 'L&D BOXY HEAVYWEIGHT HOODIE',
    subtitle: '480GSM Washed Black French Terry · Drop Shoulder',
    price: 110,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    fit: 'Boxy Street Fit',
    variants: [],
    inStock: true,
    description:
      'Cut in a boxy cropped silhouette from custom 480GSM organic French terry. Features vintage charcoal enzyme wash, double-lined hood, and puff-print L&D chest branding.'
  },
  {
    id: 'ld-cargo-02',
    slug: 'ld-cargo-02',
    badge: 'AVAILABLE 19/250',
    name: 'PARACHUTE CARGO PANTS V2',
    subtitle: 'Technical Cotton-Nylon Ripstop · 8 Utility Pockets',
    price: 135,
    category: 'pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    fit: 'Relaxed Stacked Fit',
    variants: [],
    inStock: true,
    description:
      'Articulated knee pleats, adjustable ankle bungee toggles, and heavy-duty matte black hardware. Engineered for relaxed stacked draping over bulky sneakers.'
  },
  {
    id: 'ld-tee-03',
    slug: 'ld-tee-03',
    badge: 'AVAILABLE 42/250',
    name: 'ACID WASH GRAPHIC TEE',
    subtitle: '300GSM Heavy Jersey · Brutalist Screenprint',
    price: 58,
    category: 'tees',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    fit: 'Oversized Drop Shoulder',
    variants: [],
    inStock: true,
    description:
      'Sun-faded acid wash heavyweight cotton tee with thick high-ribbed collar and distressed neon-pink & white archive screenprint across chest and back.'
  },
  {
    id: 'ld-bomber-04',
    slug: 'ld-bomber-04',
    badge: 'AVAILABLE 12/250',
    name: 'DISTRESSED VARSITY BOMBER',
    subtitle: 'Heavyweight Twill & Chenille Patches · Quilted Lining',
    price: 210,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    fit: 'Oversized Cropped',
    variants: [],
    inStock: true,
    description:
      'Oversized cropped varsity bomber jacket featuring hand-distressed rib trims, custom chenille L&D emblems, two-way YKK® metal zipper, and satin diamond lining.'
  },
  {
    id: 'ld-sneaker-05',
    slug: 'ld-sneaker-05',
    badge: 'AVAILABLE 15/250',
    name: 'L&D LOW-TOP SNEAKER "CONCRETE"',
    subtitle: 'Full-Grain Leather & Suede · Sculpted Cup Sole',
    price: 165,
    category: 'sneakers',
    image: '/images/products/shoe-concrete.jpg',
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 9.5',
    fit: 'True to Size',
    variants: [],
    inStock: true,
    description:
      'Hand-lasted low-top skate & street silhouette crafted with supple full-grain leather, hairy suede overlays, padded fat tongue, and custom L&D tread outsole.'
  },
  {
    id: 'ld-utility-06',
    slug: 'ld-utility-06',
    badge: 'AVAILABLE 34/250',
    name: 'UTILITY CROSSBODY BAG & BEANIE SET',
    subtitle: 'Cordura® Ballistic Sling + Ribbed Knit Beanie',
    price: 65,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
    sizes: ['ONE SIZE'],
    defaultSize: 'ONE SIZE',
    fit: 'Adjustable One Size',
    variants: [],
    inStock: true,
    description:
      'Two-piece tactical street bundle pairing a weatherproof 1000D Cordura® crossbody pouch with a heavyweight fisherman knit beanie with woven L&D label.'
  }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let products = [];
let isApiConnected = false;
let cart = loadCartFromStorage();
let activeFilter = 'all';
let appliedPromo = null; // { code, discountType, discountValue, discountAmount, description }
let selectedQuickSize = 'L';
let activeQuickIndex = 0;

let quickViewModalInstance = null;
let checkoutModalInstance = null;
let cartOffcanvasInstance = null;
let toastInstance = null;

// ==========================================================================
// API CLIENT HELPER
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const detailMessage = Array.isArray(data?.details) && data.details.length > 0
      ? data.details.map((d) => d.message).join(' · ')
      : null;
    const error = new Error(detailMessage || data?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    error.code = data?.error || 'API_ERROR';
    error.details = data?.details || [];
    throw error;
  }

  return data;
}

function formatPrice(amount) {
  const num = Number(amount) || 0;
  return Number.isInteger(num) ? `$${num}` : `$${num.toFixed(2)}`;
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

function normalizeProduct(raw) {
  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const sizes =
    Array.isArray(raw.sizes) && raw.sizes.length > 0
      ? raw.sizes
      : [raw.defaultSize || 'ONE SIZE'];

  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug || String(raw.id),
    badge: raw.badge || (raw.inStock === false ? 'SOLD OUT' : 'IN STOCK'),
    name: raw.name || raw.title || 'L&D GARMENT',
    subtitle: raw.subtitle || '',
    price: Number(raw.price) || 0,
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : null,
    category: raw.category || 'all',
    categoryName: raw.categoryName || raw.category || '',
    image: raw.image || raw.imageUrl || '',
    sizes,
    defaultSize: raw.defaultSize || sizes[0],
    fit: raw.fit || 'BOXY STREET FIT',
    variants,
    totalStock: typeof raw.totalStock === 'number' ? raw.totalStock : null,
    inStock: raw.inStock !== false,
    description: raw.description || ''
  };
}

function findVariant(product, size) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }
  return product.variants.find((v) => v.size === size && v.isActive !== false) || null;
}

function getDefaultAvailableSize(product) {
  if (!product) return 'ONE SIZE';
  const defaultVariant = findVariant(product, product.defaultSize);
  if (!defaultVariant || defaultVariant.stock > 0) {
    return product.defaultSize || product.sizes[0] || 'ONE SIZE';
  }
  const firstInStock = product.variants.find((v) => v.isActive !== false && v.stock > 0);
  return firstInStock ? firstInStock.size : product.defaultSize || product.sizes[0] || 'ONE SIZE';
}

// ==========================================================================
// LOAD CATALOG FROM BACKEND API (GET /api/products)
// ==========================================================================
async function loadProducts() {
  const feed = document.getElementById('productFeed');
  if (feed && products.length === 0) {
    feed.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-dark" role="status" aria-label="Cargando catálogo"></div>
        <p class="font-mono-tech small text-uppercase mt-3 mb-0 opacity-75">
          LOADING ARCHIVE DROP FROM API...
        </p>
      </div>
    `;
  }

  try {
    const data = await apiRequest('/api/products?limit=50');
    const items = Array.isArray(data?.items) ? data.items : [];
    products = items.map(normalizeProduct);
    isApiConnected = true;
  } catch (err) {
    console.warn('No se pudo cargar el catálogo desde el backend, usando catálogo local:', err.message);
    products = FALLBACK_PRODUCTS.map(normalizeProduct);
    isApiConnected = false;
    showToast('OFFLINE MODE: SHOWING LOCAL CATALOG');
  }

  updateCategoryFilterCounts();
  renderProducts();
}

function updateCategoryFilterCounts() {
  const allBtn = document.querySelector('#categoryFilters [data-filter="all"]');
  if (allBtn) {
    allBtn.textContent = `ALL (${products.length})`;
  }
}

// ==========================================================================
// RENDER PRODUCT CATALOG (BOOTSTRAP 5 GRID)
// ==========================================================================
function renderProducts() {
  const feed = document.getElementById('productFeed');
  if (!feed) return;

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((product) => product.category === activeFilter);

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="font-display fs-3 text-uppercase mb-1">NO PIECES IN THIS CATEGORY</p>
        <p class="font-mono-tech small text-secondary mb-0">SELECT ANOTHER FILTER TO EXPLORE DROP 04.</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = filtered
    .map((product) => {
      const originalIndex = products.findIndex((p) => p.slug === product.slug);
      const fallbackUrl = `https://placehold.co/800x840/141414/FFFFFF?text=${encodeURIComponent(
        product.name
      )}`;
      const isSoldOut = product.inStock === false;
      const sizeLabel =
        product.sizes.length > 1
          ? `SIZES: ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`
          : `SIZE: ${product.sizes[0]}`;

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <article class="card h-100 dich-product-card surface-card">
            <div class="dich-product-top brutal-border px-3 py-2 d-flex align-items-center justify-content-between">
              <span class="font-mono-tech fw-bold text-dich-yellow">${product.badge}</span>
              <span class="font-mono-tech text-white-50">${product.category}</span>
            </div>

            <div class="dich-product-media" data-action="quick-view" data-index="${originalIndex}">
              <img
                src="${product.image}"
                alt="${product.name}"
                data-fallback="${fallbackUrl}"
              />

              <button
                type="button"
                class="add-cart-ribbon"
                data-action="quick-add"
                data-index="${originalIndex}"
                title="Quick Add ${product.name}"
                ${isSoldOut ? 'disabled' : ''}
              >
                <div class="animate-marquee-fast text-nowrap font-display fs-6 tracking-wider text-uppercase d-flex align-items-center">
                  <span class="mx-3">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                  <span class="mx-3 text-dich-pink">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                  <span class="mx-3">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                  <span class="mx-3 text-dich-pink">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                  <span class="mx-3">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                  <span class="mx-3 text-dich-pink">${isSoldOut ? '✕ SOLD OUT' : '⚡ ADD TO CART'}</span>
                </div>
              </button>

              <span class="size-badge-overlay font-mono-tech shadow-sm">
                ${sizeLabel}
              </span>
            </div>

            <div class="card-body d-flex flex-column justify-content-between p-4 gap-3">
              <div>
                <div class="d-flex align-items-start justify-content-between gap-2">
                  <h3
                    class="font-display fs-4 text-uppercase mb-0 lh-sm"
                    role="button"
                    data-action="quick-view"
                    data-index="${originalIndex}"
                  >
                    ${product.name}
                  </h3>
                  <span class="font-mono-tech fw-bold fs-5 flex-shrink-0">${formatPrice(product.price)}</span>
                </div>
                <p class="font-mono-tech small opacity-75 mb-0 mt-1" style="font-size: 0.72rem;">
                  ${product.subtitle}
                </p>
              </div>

              <div class="d-flex gap-2 pt-1">
                <button
                  type="button"
                  class="btn btn-dich-outline flex-grow-1"
                  data-action="quick-view"
                  data-index="${originalIndex}"
                >
                  SELECT SIZE
                </button>
                <button
                  type="button"
                  class="btn btn-dich-pink"
                  data-action="quick-add"
                  data-index="${originalIndex}"
                  ${isSoldOut ? 'disabled' : ''}
                >
                  ${isSoldOut ? 'OUT' : '+ BAG'}
                </button>
              </div>
            </div>
          </article>
        </div>
      `;
    })
    .join('');
}

function filterProducts(category) {
  activeFilter = category;
  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.classList.toggle('active-filter', btn.dataset.filter === category);
  });
  renderProducts();
}

// ==========================================================================
// QUICK-VIEW MODAL (BOOTSTRAP 5 MODAL)
// ==========================================================================
function openQuickView(index) {
  let product = products[index];
  if (!product && products.length > 0) {
    product = products.find((p) => p.slug === 'ld-sneaker-05' || p.category === 'sneakers') || products[0];
    index = products.indexOf(product);
  }
  if (!product) return;

  activeQuickIndex = index;
  selectedQuickSize = getDefaultAvailableSize(product);

  const selectedVariant = findVariant(product, selectedQuickSize);
  const stockInfo = selectedVariant
    ? `STOCK: ${selectedVariant.stock} UNITS`
    : product.fit.toUpperCase();

  const content = document.getElementById('quickViewContent');
  const fallbackUrl = `https://placehold.co/800x840/141414/FFFFFF?text=${encodeURIComponent(
    product.name
  )}`;

  content.innerHTML = `
    <div class="col-12 col-md-6 quickview-img-col position-relative">
      <img src="${product.image}" alt="${product.name}" data-fallback="${fallbackUrl}" />
      <span class="position-absolute top-0 start-0 m-3 bg-dich-black text-dich-yellow border border-warning font-mono-tech fw-bold px-2 py-1" style="font-size: 0.65rem;">
        ${product.badge}
      </span>
    </div>

    <div class="col-12 col-md-6 p-4 p-sm-5 d-flex flex-column justify-content-between gap-4">
      <div>
        <span class="font-mono-tech text-uppercase text-secondary d-block" style="font-size: 0.65rem; letter-spacing: 0.12em;">
          DROP 04 // ${product.category}
        </span>
        <h3 class="font-display fs-2 text-uppercase mt-1 mb-0 lh-1">${product.name}</h3>
        <p class="font-mono-tech fs-4 fw-bold text-dich-pink mt-2 mb-0">${formatPrice(product.price)}</p>
        <p class="small text-secondary lh-base mt-3 mb-0" style="font-size: 0.78rem;">
          ${product.description}
        </p>
      </div>

      <div>
        <div class="d-flex justify-content-between fw-bold text-uppercase mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          <span>SELECT SIZE</span>
          <span id="quickViewStockLabel" class="text-secondary">${stockInfo}</span>
        </div>
        <div class="row g-2" id="sizeGrid">
          ${product.sizes
            .map((size) => {
              const variant = findVariant(product, size);
              const outOfStock = variant && variant.stock <= 0;
              return `
                <div class="col-3">
                  <button
                    type="button"
                    class="size-btn w-100 font-mono-tech ${
                      size === selectedQuickSize ? 'is-selected' : ''
                    } ${outOfStock ? 'opacity-50 text-decoration-line-through' : ''}"
                    data-action="select-size"
                    data-size="${size}"
                    ${outOfStock ? 'disabled' : ''}
                  >
                    ${size}
                  </button>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <button
        type="button"
        class="btn btn-dich-primary w-100 shadow"
        data-action="modal-add-to-cart"
        ${product.inStock === false ? 'disabled' : ''}
      >
        ${product.inStock === false ? 'SOLD OUT' : `ADD TO CART — ${formatPrice(product.price)}`}
      </button>
    </div>
  `;

  quickViewModalInstance?.show();
}

function selectSize(size, btnEl) {
  selectedQuickSize = size;
  document.querySelectorAll('#sizeGrid .size-btn').forEach((btn) => {
    btn.classList.remove('is-selected');
  });
  btnEl.classList.add('is-selected');

  const product = products[activeQuickIndex];
  const variant = findVariant(product, size);
  const stockLabel = document.getElementById('quickViewStockLabel');
  if (stockLabel && variant) {
    stockLabel.textContent = `STOCK: ${variant.stock} UNITS`;
  }
}

// ==========================================================================
// SHOPPING CART & OFFCANVAS DRAWER (BOOTSTRAP 5 OFFCANVAS)
// ==========================================================================
function quickAddToCart(index) {
  const product = products[index];
  if (!product || product.inStock === false) return;
  addToCart(index, getDefaultAvailableSize(product));
}

function addToCart(index, size) {
  const product = products[index];
  if (!product) return;

  const variant = findVariant(product, size);
  if (variant && variant.stock <= 0) {
    showToast(`SIZE ${size} IS OUT OF STOCK`);
    return;
  }

  const existing = cart.find((item) => item.slug === product.slug && item.size === size);
  if (existing) {
    if (variant && existing.qty >= variant.stock) {
      showToast(`MAX STOCK REACHED (${variant.stock})`);
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      slug: product.slug,
      variantId: variant?.id ?? null,
      name: product.name,
      price: variant?.priceOverride ?? product.price,
      image: product.image,
      size,
      maxStock: variant ? variant.stock : null,
      qty: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`ADDED ${product.name} (${size})`);
}

function updateQty(idx, delta) {
  const item = cart[idx];
  if (!item) return;

  const nextQty = item.qty + delta;
  if (nextQty <= 0) {
    cart.splice(idx, 1);
  } else if (item.maxStock !== null && item.maxStock !== undefined && nextQty > item.maxStock) {
    showToast(`ONLY ${item.maxStock} IN STOCK FOR ${item.size}`);
    return;
  } else {
    item.qty = nextQty;
  }

  if (cart.length === 0) {
    appliedPromo = null;
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  if (cart.length === 0) {
    appliedPromo = null;
  }
  saveCartToStorage();
  updateCartUI();
}

function calculateCartTotals() {
  const subtotal = Math.round(cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
  let discount = 0;

  if (appliedPromo && subtotal > 0) {
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedPromo.discountValue / 100) * 100) / 100;
    } else if (appliedPromo.discountType === 'fixed') {
      discount = Math.min(subtotal, appliedPromo.discountValue);
    } else {
      discount = Math.min(subtotal, appliedPromo.discountAmount || 0);
    }
  }

  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  return { subtotal, discount, total };
}

// ==========================================================================
// PROMO CODE VALIDATION (POST /api/promo-codes/validate)
// ==========================================================================
async function applyPromoCode() {
  const promoInput = document.getElementById('promoInput');
  const feedback = document.getElementById('promoFeedback');
  const applyBtn = document.getElementById('applyPromoBtn');
  if (!promoInput || !feedback) return;

  const code = promoInput.value.trim().toUpperCase();
  feedback.classList.remove('d-none', 'text-success', 'text-danger');

  if (!code) {
    appliedPromo = null;
    feedback.textContent = '✕ ENTER A PROMO CODE (E.G. FIRST15, URBAN10, SNEAKER20)';
    feedback.classList.add('text-danger', 'fw-bold');
    updateCartUI();
    return;
  }

  const { subtotal } = calculateCartTotals();
  if (applyBtn) applyBtn.disabled = true;

  try {
    const result = await apiRequest('/api/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });

    appliedPromo = {
      code: result.code,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountAmount: result.discountAmount,
      description: result.description
    };

    const promoLabel =
      result.discountType === 'percentage'
        ? `${result.discountValue}% OFF`
        : `${formatPrice(result.discountValue)} OFF`;

    feedback.textContent = `✓ PROMO CODE "${result.code}" APPLIED (${promoLabel})`;
    feedback.classList.add('text-success', 'fw-bold');
  } catch (err) {
    appliedPromo = null;
    feedback.textContent = `✕ ${err.message.toUpperCase()}`;
    feedback.classList.add('text-danger', 'fw-bold');
  } finally {
    if (applyBtn) applyBtn.disabled = false;
  }

  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBadge = document.getElementById('cartCountBadge');
  const drawerBadge = document.getElementById('drawerCountBadge');
  if (cartBadge) cartBadge.textContent = `(${totalItems})`;
  if (drawerBadge) drawerBadge.textContent = totalItems;

  const container = document.getElementById('cartItemsContainer');
  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5 gap-3">
          <span class="font-display fs-1 text-secondary opacity-50 text-uppercase">YOUR BAG IS EMPTY</span>
          <p class="small text-secondary text-uppercase mb-0" style="max-width: 18rem; letter-spacing: 0.08em; font-size: 0.72rem;">
            EXPLORE OUR 480GSM HEAVYWEIGHT STREETWEAR &amp; FOOTWEAR DROP.
          </p>
          <button type="button" class="btn btn-dich-primary px-4 py-2 fs-6" data-bs-dismiss="offcanvas">
            BROWSE DROP 04
          </button>
        </div>
      `;
    } else {
      container.innerHTML = cart
        .map(
          (item, idx) => `
          <div class="dich-cart-item d-flex gap-3 p-3 shadow-sm mb-3">
            <img src="${item.image}" alt="${item.name}" />
            <div class="flex-grow-1 d-flex flex-column justify-content-between">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <h4 class="fw-bold text-uppercase mb-0 lh-sm" style="font-size: 0.75rem;">${item.name}</h4>
                  <span class="font-mono-tech text-secondary" style="font-size: 0.65rem;">SIZE: ${item.size}</span>
                </div>
                <button
                  type="button"
                  class="btn btn-sm p-0 border-0 text-secondary"
                  data-action="remove-item"
                  data-index="${idx}"
                  title="Remove"
                >
                  ✕
                </button>
              </div>

              <div class="d-flex align-items-center justify-content-between mt-2">
                <div class="btn-group btn-group-sm border rounded-pill overflow-hidden font-mono-tech" role="group">
                  <button type="button" class="btn btn-light px-2 py-0 border-0" data-action="qty-minus" data-index="${idx}">-</button>
                  <span class="px-2 fw-bold d-flex align-items-center bg-white" style="font-size: 0.75rem;">${item.qty}</span>
                  <button type="button" class="btn btn-light px-2 py-0 border-0" data-action="qty-plus" data-index="${idx}">+</button>
                </div>
                <span class="font-mono-tech fw-bold small">${formatPrice(item.price * item.qty)}</span>
              </div>
            </div>
          </div>
        `
        )
        .join('');
    }
  }

  const { subtotal, discount, total } = calculateCartTotals();

  const subtotalEl = document.getElementById('cartSubtotal');
  const discountRow = document.getElementById('discountRow');
  const discountLabel = document.getElementById('discountLabel');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);

  if (discountRow && discountEl) {
    if (appliedPromo && discount > 0) {
      discountRow.classList.remove('d-none');
      discountRow.classList.add('d-flex');
      if (discountLabel) {
        const suffix =
          appliedPromo.discountType === 'percentage'
            ? `-${appliedPromo.discountValue}%`
            : `-${formatPrice(appliedPromo.discountValue)}`;
        discountLabel.textContent = `DISCOUNT (${appliedPromo.code} ${suffix})`;
      }
      discountEl.textContent = `-${formatPrice(discount)}`;
    } else {
      discountRow.classList.add('d-none');
      discountRow.classList.remove('d-flex');
    }
  }
}

// ==========================================================================
// CHECKOUT MODAL & ORDER CREATION (POST /api/orders)
// ==========================================================================
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('ADD A STREETWEAR PIECE FIRST!');
    return;
  }

  const summaryEl = document.getElementById('checkoutSummary');
  const errorEl = document.getElementById('checkoutError');
  if (errorEl) {
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
  }

  const { subtotal, discount, total } = calculateCartTotals();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="d-flex justify-content-between">
        <span>ITEMS (${totalItems})</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      ${
        appliedPromo && discount > 0
          ? `<div class="d-flex justify-content-between text-dich-pink mt-1">
               <span>PROMO (${appliedPromo.code})</span>
               <span>-${formatPrice(discount)}</span>
             </div>`
          : ''
      }
      <div class="d-flex justify-content-between fw-bold fs-6 mt-2 pt-2 border-top border-dark">
        <span>TOTAL TO PAY</span>
        <span>${formatPrice(total)}</span>
      </div>
    `;
  }

  cartOffcanvasInstance?.hide();
  checkoutModalInstance?.show();
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const form = event.target;
  const errorEl = document.getElementById('checkoutError');
  const submitBtn = document.getElementById('confirmOrderBtn');

  if (errorEl) {
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
  }

  const formData = new FormData(form);
  const payload = {
    customerName: String(formData.get('customerName') || '').trim(),
    customerEmail: String(formData.get('customerEmail') || '').trim(),
    customerPhone: String(formData.get('customerPhone') || '').trim() || undefined,
    shippingAddress: String(formData.get('shippingAddress') || '').trim(),
    shippingCity: String(formData.get('shippingCity') || '').trim(),
    shippingPostalCode: String(formData.get('shippingPostalCode') || '').trim() || undefined,
    paymentMethod: String(formData.get('paymentMethod') || 'mercadopago'),
    promoCode: appliedPromo?.code || undefined,
    items: cart.map((item) => ({
      ...(item.variantId ? { variantId: item.variantId } : {}),
      slug: item.slug,
      size: item.size,
      quantity: item.qty
    }))
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'PROCESSING ORDER...';
  }

  try {
    const order = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    cart = [];
    appliedPromo = null;
    saveCartToStorage();

    const promoInput = document.getElementById('promoInput');
    const promoFeedback = document.getElementById('promoFeedback');
    if (promoInput) promoInput.value = '';
    if (promoFeedback) promoFeedback.classList.add('d-none');

    form.reset();
    updateCartUI();
    checkoutModalInstance?.hide();
    showToast(`ORDER #${order.orderNumber} CONFIRMED! 🔥`);

    // Refresh catalog stock from database
    await loadProducts();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'No se pudo procesar la orden. Intentá nuevamente.';
      errorEl.classList.remove('d-none');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'CONFIRM ORDER →';
    }
  }
}

// ==========================================================================
// URBAN MODE, NEWSLETTER (POST /api/newsletter/subscribe), TOAST & PARALLAX
// ==========================================================================
function toggleUrbanMode() {
  const isUrban = document.body.classList.toggle('urban-mode');
  const dot = document.getElementById('urbanDot');
  const label = document.getElementById('urbanLabel');

  if (isUrban) {
    dot?.classList.add('is-active');
    if (label) label.textContent = 'URBAN: ON';
    showToast('NIGHT STREET MODE ACTIVATED ⚡');
  } else {
    dot?.classList.remove('is-active');
    if (label) label.textContent = 'URBAN MODE';
    showToast('EDITORIAL DAYLIGHT MODE');
  }
}

async function handleNewsletter(event) {
  event.preventDefault();
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const msg = document.getElementById('newsletterMsg');

  const email = emailInput ? emailInput.value.trim() : '';
  if (!email) return;

  if (submitBtn) submitBtn.disabled = true;

  try {
    const result = await apiRequest('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (msg) {
      msg.textContent = `✓ ${result.message || 'WELCOME! USE CODE "FIRST15" AT CHECKOUT FOR 15% OFF.'}`;
      msg.classList.remove('d-none', 'text-danger');
      msg.classList.add('text-dich-pink');
    }
    form.reset();
  } catch (err) {
    if (msg) {
      msg.textContent = `✕ ${err.message || 'Error al suscribirse al newsletter.'}`;
      msg.classList.remove('d-none', 'text-dich-pink');
      msg.classList.add('text-danger');
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function showToast(message) {
  const toastEl = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  if (!toastEl || !toastText) return;

  toastText.textContent = message;
  toastInstance?.show();
}

// ==========================================================================
// INITIALIZATION & EVENT DELEGATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap 5 Components
  const modalEl = document.getElementById('quickViewModal');
  const checkoutModalEl = document.getElementById('checkoutModal');
  const offcanvasEl = document.getElementById('cartDrawer');
  const toastEl = document.getElementById('toastNotification');

  if (modalEl && window.bootstrap) {
    quickViewModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  }
  if (checkoutModalEl && window.bootstrap) {
    checkoutModalInstance = bootstrap.Modal.getOrCreateInstance(checkoutModalEl);
  }
  if (offcanvasEl && window.bootstrap) {
    cartOffcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  }
  if (toastEl && window.bootstrap) {
    toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3200 });
  }

  // Load live catalog from backend API & render cart state
  loadProducts();
  updateCartUI();

  // Category filter pills
  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => filterProducts(btn.dataset.filter));
  });

  // Urban mode toggle
  document.getElementById('urbanModeBtn')?.addEventListener('click', toggleUrbanMode);

  // Promo code apply & checkout modal
  document.getElementById('applyPromoBtn')?.addEventListener('click', applyPromoCode);
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
  document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckoutSubmit);

  // Newsletter subscription
  document.getElementById('newsletterForm')?.addEventListener('submit', handleNewsletter);

  // Collapse mobile navbar smoothly after clicking a link
  const navbarCollapseEl = document.getElementById('dichNavbarNav');
  if (navbarCollapseEl && window.bootstrap) {
    navbarCollapseEl.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl);
        bsCollapse?.hide();
      });
    });
  }

  // Event delegation for dynamic & interactive actions
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const index = Number(target.dataset.index);

    switch (action) {
      case 'quick-view':
        openQuickView(index);
        break;
      case 'quick-add':
        event.stopPropagation();
        quickAddToCart(index);
        break;
      case 'select-size':
        selectSize(target.dataset.size, target);
        break;
      case 'modal-add-to-cart':
        addToCart(activeQuickIndex, selectedQuickSize);
        quickViewModalInstance?.hide();
        break;
      case 'qty-minus':
        updateQty(index, -1);
        break;
      case 'qty-plus':
        updateQty(index, 1);
        break;
      case 'remove-item':
        removeCartItem(index);
        break;
      default:
        break;
    }
  });

  // Global image fallback handler (replaces inline onerror)
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img.tagName === 'IMG' && img.dataset.fallback && !img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';
        img.src = img.dataset.fallback;
      }
    },
    true
  );

  // Scroll shadow & floating studio sneaker parallax
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const header = document.getElementById('mainHeader');
    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }

    const leftSneaker = document.getElementById('heroSneakerLeft');
    const rightSneaker = document.getElementById('heroSneakerRight');
    if (leftSneaker && rightSneaker && scrollY < 900) {
      leftSneaker.style.marginTop = `${scrollY * 0.07}px`;
      rightSneaker.style.marginTop = `${scrollY * 0.09}px`;
    }
  });
});

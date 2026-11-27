'use strict';

// ==========================================================================
// DICH™ / L&D STREETWEAR — BRUTALIST FRONTEND CONNECTED TO EXPRESS + MYSQL
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
const AUTH_TOKEN_KEY = 'ld_store_token_v1';
const ARS_FORMATTER = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

const SKULL_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C7.03 2 3 5.8 3 10.5C3 13.3 4.45 15.78 6.7 17.3V20.5C6.7 21.33 7.37 22 8.2 22H15.8C16.63 22 17.3 21.33 17.3 20.5V17.3C19.55 15.78 21 13.3 21 10.5C21 5.8 16.97 2 12 2ZM8.8 13.2C7.8 13.2 7 12.4 7 11.4C7 10.4 7.8 9.6 8.8 9.6C9.8 9.6 10.6 10.4 10.6 11.4C10.6 12.4 9.8 13.2 8.8 13.2ZM12 16.2L10.9 14.5H13.1L12 16.2ZM15.2 13.2C14.2 13.2 13.4 12.4 13.4 11.4C13.4 10.4 14.2 9.6 15.2 9.6C16.2 9.6 17 10.4 17 11.4C17 12.4 16.2 13.2 15.2 13.2Z"/>
  </svg>
`;

const LOOKBOOK_SLIDES = [
  {
    img: '/images/products/model-limited.jpg',
    line1: 'ONLY 1500 PIECES',
    line2: 'FOR THIS DROP'
  },
  {
    img: '/images/products/skate-ollie.jpg',
    line1: 'BUILT FOR CONCRETE',
    line2: 'ZERO COMPROMISE'
  },
  {
    img: '/images/products/sneakers-topdown.jpg',
    line1: 'HAND-NUMBERED RUN',
    line2: 'LOCAL PRODUCTION'
  }
];

// Fallback catalog (precios en Pesos Argentinos ARS) usado solo si la API / MySQL no está conectada
const FALLBACK_PRODUCTS = [
  {
    id: 'ld-sneaker-05',
    slug: 'ld-sneaker-05',
    badge: 'CÁPSULA LAUNCH · 15/150',
    name: 'L&D LOW-TOP SNEAKER "CONCRETE DP7"',
    subtitle: 'Full-Grain Leather & Hairy Suede',
    price: 189000,
    category: 'sneakers',
    image: '/images/products/ld-sneaker-05-depaul.jpg',
    galleryUrls: ['/images/products/ld-sneaker-05-depaul.jpg', '/images/products/shoe-concrete.jpg'],
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 9.5',
    fit: 'True to Size',
    variants: [],
    inStock: true,
    description:
      'Primera zapatilla del lanzamiento cápsula L&D. Silueta low-top urbana en cuero vacuno off-white, paneles de gamuza gris y acentos carmesí.'
  },
  {
    id: 'ld-runner-07',
    slug: 'ld-runner-07',
    badge: 'NEW DROP 04',
    name: 'L&D ASPHALT CHUNKY RUNNER',
    subtitle: 'Slate Ripstop Mesh & Hairy Suede',
    price: 178000,
    category: 'sneakers',
    image: '/images/products/ld-runner-asphalt.jpg',
    galleryUrls: ['/images/products/ld-runner-asphalt.jpg'],
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 10',
    fit: 'True to Size',
    variants: [],
    inStock: true,
    description:
      'Zapatilla urbana de estética chunky runner en gris pizarra y carbón con paneles de gamuza cepillada y tirador trasero rosa neón.'
  },
  {
    id: 'ld-hoodie-01',
    slug: 'ld-hoodie-01',
    badge: 'CÁPSULA 01 · 28/250',
    name: 'L&D BOXY HEAVYWEIGHT HOODIE "NOCTURNE"',
    subtitle: '480GSM Washed Charcoal French Terry',
    price: 118000,
    category: 'hoodies',
    image: '/images/products/ld-hoodie-01-depaul.jpg',
    galleryUrls: ['/images/products/ld-hoodie-01-depaul.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    fit: 'Boxy Street Fit',
    variants: [],
    inStock: true,
    description:
      'Cut in a boxy cropped silhouette from custom 480GSM organic French terry with vintage charcoal enzyme wash.'
  },
  {
    id: 'ld-sneaker-12',
    slug: 'ld-sneaker-12',
    badge: '2 COLORWAYS · DROP 04',
    name: 'L&D NEON PULSE TECH',
    subtitle: 'Obsidian Mesh & Liquid-Silver Cage',
    price: 195000,
    category: 'sneakers',
    image: '/images/products/ld-neon-pulse-pink.jpg',
    galleryUrls: ['/images/products/ld-neon-pulse-pink.jpg', '/images/products/ld-neon-pulse-blue.jpg'],
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 10',
    fit: 'True to Size',
    variants: [
      { id: null, size: 'US 9', color: 'Neon Pink', colorHex: '#FF2E93', stock: 5, isActive: true },
      { id: null, size: 'US 10', color: 'Neon Pink', colorHex: '#FF2E93', stock: 5, isActive: true },
      { id: null, size: 'US 9', color: 'Neon Blue', colorHex: '#00D4FF', stock: 5, isActive: true },
      { id: null, size: 'US 10', color: 'Neon Blue', colorHex: '#00D4FF', stock: 6, isActive: true }
    ],
    inStock: true,
    description:
      'Tech-runner futurista con malla negra respirable, jaula metálica plateada y estabilizador esculpido en dos variantes neón.'
  }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let products = [];
let cart = loadCartFromStorage();
let activeFilter = 'all';
let showAllProducts = false;
let appliedPromo = null;
let lookbookIdx = 0;
let selectedQuickSize = 'L';
let selectedQuickColor = null;
let activeQuickIndex = 0;
let toastTimer = null;

let authToken = (() => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
})();
let currentUser = null;
let googleClientId = null;
let googleButtonRendered = false;

// ==========================================================================
// API CLIENT & HELPERS
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const detailMessage = Array.isArray(data?.details) && data.details.length > 0
      ? data.details.map((d) => d.message).join(' · ')
      : null;
    const error = new Error(detailMessage || data?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    error.code = data?.error || 'API_ERROR';
    throw error;
  }

  return data;
}

function formatPrice(amount) {
  const num = Math.round(Number(amount) || 0);
  return `$${ARS_FORMATTER.format(num)}`;
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
    // Ignore storage quota errors
  }
}

function normalizeProduct(raw) {
  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const sizes =
    Array.isArray(raw.sizes) && raw.sizes.length > 0
      ? raw.sizes
      : [raw.defaultSize || 'ONE SIZE'];
  const galleryUrls = Array.isArray(raw.galleryUrls) && raw.galleryUrls.length > 0
    ? raw.galleryUrls
    : [raw.image || raw.imageUrl || ''].filter(Boolean);

  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug || String(raw.id),
    badge: raw.badge || (raw.inStock === false ? 'SOLD OUT' : 'AVAILABLE'),
    name: raw.name || raw.title || 'DICH™ PIECE',
    subtitle: raw.subtitle || '',
    price: Number(raw.price) || 0,
    category: raw.category || 'all',
    image: raw.image || raw.imageUrl || '',
    galleryUrls,
    sizes,
    defaultSize: raw.defaultSize || sizes[0],
    fit: raw.fit || 'BOXY STREET FIT',
    variants,
    inStock: raw.inStock !== false,
    description: raw.description || ''
  };
}

function getProductColors(product) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return [];
  const seen = new Map();
  for (const v of product.variants) {
    if (v.isActive === false || !v.color) continue;
    if (!seen.has(v.color)) {
      seen.set(v.color, { color: v.color, colorHex: v.colorHex || '#141414' });
    }
  }
  return Array.from(seen.values());
}

function getColorImage(product, colorName) {
  if (!product) return '';
  const colors = getProductColors(product);
  const colorIdx = colors.findIndex((c) => c.color === colorName);
  if (colorIdx >= 0 && Array.isArray(product.galleryUrls) && product.galleryUrls[colorIdx]) {
    return product.galleryUrls[colorIdx];
  }
  return product.image;
}

function findVariant(product, size, color = null) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return null;
  if (color) {
    const exact = product.variants.find(
      (v) => v.size === size && v.color === color && v.isActive !== false
    );
    if (exact) return exact;
  }
  return product.variants.find((v) => v.size === size && v.isActive !== false) || null;
}

function getDefaultAvailableSize(product, color = null) {
  if (!product) return 'ONE SIZE';
  const defaultVariant = findVariant(product, product.defaultSize, color);
  if (!defaultVariant || defaultVariant.stock > 0) {
    return product.defaultSize || product.sizes[0] || 'ONE SIZE';
  }
  const firstInStock = product.variants.find(
    (v) => v.isActive !== false && v.stock > 0 && (!color || v.color === color)
  );
  return firstInStock ? firstInStock.size : product.defaultSize || product.sizes[0] || 'ONE SIZE';
}

// ==========================================================================
// MODAL & DRAWER HELPERS
// ==========================================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  const anyOpen = document.querySelector('.modal-backdrop.open, .cart-drawer.open');
  if (!anyOpen) document.body.classList.remove('modal-open');
}

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  const anyOpen = document.querySelector('.modal-backdrop.open');
  if (!anyOpen) document.body.classList.remove('modal-open');
}

function showToast(text) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ==========================================================================
// VISUAL DECORATIONS (TOP SECRET TAPE, LOOKBOOK, CRACK)
// ==========================================================================
function initTopSecretTape() {
  const items = Array.from({ length: 10 }, () => `
    <span class="tape-item">
      ${SKULL_SVG}
      <span>TOP SECRET</span>
    </span>
  `).join('');
  const a = document.getElementById('tapeGroupA');
  const b = document.getElementById('tapeGroupB');
  if (a) a.innerHTML = items;
  if (b) b.innerHTML = items;
}

function cycleLookbook(delta) {
  lookbookIdx = (lookbookIdx + delta + LOOKBOOK_SLIDES.length) % LOOKBOOK_SLIDES.length;
  const slide = LOOKBOOK_SLIDES[lookbookIdx];
  const img = document.getElementById('lookbookImg');
  if (!img) return;
  img.style.opacity = '0.35';
  setTimeout(() => {
    img.src = slide.img;
    const l1 = document.getElementById('lookbookLine1');
    const l2 = document.getElementById('lookbookLine2');
    if (l1) l1.textContent = slide.line1;
    if (l2) l2.textContent = slide.line2;
    img.style.opacity = '1';
  }, 160);
}

function pulseCrack() {
  const crack = document.getElementById('destroyCrackSvg');
  if (!crack) return;
  crack.style.transform = 'scale(1.18) rotate(-3deg)';
  setTimeout(() => {
    crack.style.transform = '';
  }, 240);
  showToast('NO COMPROMISES — LIMITED DROP 04');
}

// ==========================================================================
// LOAD & RENDER CATALOG (GET /api/products)
// ==========================================================================
async function loadProducts() {
  const stack = document.getElementById('productStack');
  if (stack && products.length === 0) {
    stack.innerHTML = `<div class="product-stack-status">LOADING ARCHIVE DROP FROM API...</div>`;
  }

  try {
    const data = await apiRequest('/api/products?limit=50');
    const items = Array.isArray(data?.items) ? data.items : [];
    products = items.map(normalizeProduct);
  } catch (err) {
    console.warn('No se pudo cargar el catálogo desde la API, usando catálogo local:', err.message);
    products = FALLBACK_PRODUCTS.map(normalizeProduct);
    showToast('OFFLINE MODE: SHOWING LOCAL CATALOG');
  }

  const allBtn = document.querySelector('#categoryFilters [data-filter="all"]');
  if (allBtn) allBtn.textContent = `ALL (${products.length})`;
  renderProducts();
}

function renderProducts() {
  const stack = document.getElementById('productStack');
  if (!stack) return;

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => p.category === activeFilter);

  const visible =
    activeFilter === 'all' && !showAllProducts
      ? filtered.slice(0, 4)
      : filtered;

  const allLabel = document.getElementById('allProductsLabel');
  if (allLabel) {
    if (activeFilter !== 'all') {
      allLabel.textContent = 'SHOW ALL PRODUCTS';
    } else {
      allLabel.textContent = showAllProducts ? 'FEATURED ONLY' : `ALL PRODUCTS (${products.length})`;
    }
  }

  if (visible.length === 0) {
    stack.innerHTML = `
      <div class="product-stack-status">
        NO PIECES IN THIS CATEGORY — SELECT ANOTHER FILTER.
      </div>
    `;
    return;
  }

  stack.innerHTML = visible
    .map((product) => {
      const originalIndex = products.findIndex((p) => p.slug === product.slug);
      const isSoldOut = product.inStock === false;
      const ribbonText = isSoldOut ? 'SOLD OUT' : 'ADD TO CART';
      const ribbonRepeat = Array.from({ length: 8 }, () => `
        <span class="ribbon-item">
          ${SKULL_SVG}
          <span>${ribbonText}</span>
        </span>
      `).join('');

      const colors = getProductColors(product);
      const swatchesHtml = colors.length > 1
        ? `<div class="product-swatches">
             ${colors.map((c) => `<span class="swatch-dot" title="${c.color}" style="background:${c.colorHex};"></span>`).join('')}
             <span class="swatch-count">${colors.length} COLORWAYS</span>
           </div>`
        : '';

      const fallbackUrl = `https://placehold.co/800x840/141414/FFFFFF?text=${encodeURIComponent(product.name)}`;

      return `
        <article class="product-card">
          <span class="torn-badge">${product.badge}</span>
          <div class="product-media-box" data-action="quick-view" data-index="${originalIndex}">
            <img src="${product.image}" alt="${product.name}" data-fallback="${fallbackUrl}" />
            <button
              type="button"
              class="add-to-cart-ribbon"
              data-action="quick-add"
              data-index="${originalIndex}"
              aria-label="Add ${product.name} to cart"
              ${isSoldOut ? 'disabled' : ''}
            >
              <div class="marquee-track-fast">
                <div class="tape-group">${ribbonRepeat}</div>
                <div class="tape-group" aria-hidden="true">${ribbonRepeat}</div>
              </div>
            </button>
          </div>
          <div class="product-meta">
            <div class="product-meta-title" data-action="quick-view" data-index="${originalIndex}">
              <span class="product-meta-name">${product.name}</span>
              <span class="product-meta-sub">${product.subtitle}</span>
              ${swatchesHtml}
            </div>
            <span class="product-meta-price">${formatPrice(product.price)}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function filterProducts(category) {
  activeFilter = category;
  document.querySelectorAll('#categoryFilters .filter-pill').forEach((btn) => {
    btn.classList.toggle('active-filter', btn.dataset.filter === category);
  });
  renderProducts();
}

function toggleAllProducts() {
  if (activeFilter !== 'all') {
    showAllProducts = true;
    filterProducts('all');
    showToast('SHOWING FULL ARCHIVE DROP');
    return;
  }
  showAllProducts = !showAllProducts;
  renderProducts();
  showToast(showAllProducts ? 'SHOWING FULL ARCHIVE DROP' : 'SHOWING FEATURED DROP');
}

// ==========================================================================
// QUICK-VIEW MODAL (COLOR + SIZE + LIVE STOCK)
// ==========================================================================
function openQuickView(index) {
  const product = products[index];
  if (!product) return;

  activeQuickIndex = index;
  const colors = getProductColors(product);
  selectedQuickColor = colors.length > 0 ? colors[0].color : null;
  selectedQuickSize = getDefaultAvailableSize(product, selectedQuickColor);

  const selectedVariant = findVariant(product, selectedQuickSize, selectedQuickColor);
  const stockInfo = selectedVariant
    ? `STOCK: ${selectedVariant.stock} UNITS`
    : product.fit.toUpperCase();
  const activeImage = getColorImage(product, selectedQuickColor);
  const fallbackUrl = `https://placehold.co/800x840/141414/FFFFFF?text=${encodeURIComponent(product.name)}`;

  const colorSelectorHtml = colors.length > 1
    ? `
      <div>
        <div class="selector-header">
          <span>SELECT COLOR</span>
          <span id="quickViewColorLabel">${selectedQuickColor}</span>
        </div>
        <div class="color-grid" id="colorGrid">
          ${colors
            .map(
              (c) => `
                <button
                  type="button"
                  class="color-pill ${c.color === selectedQuickColor ? 'active' : ''}"
                  data-action="select-color"
                  data-color="${c.color}"
                >
                  <span class="color-pill-dot" style="background:${c.colorHex};"></span>
                  <span>${c.color}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </div>
    `
    : '';

  const body = document.getElementById('quickViewBody');
  if (!body) return;

  body.innerHTML = `
    <div class="quickview-img-wrap">
      <img id="quickViewMainImg" src="${activeImage}" alt="${product.name}" data-fallback="${fallbackUrl}" />
      <span class="torn-badge quickview-badge">${product.badge}</span>
    </div>
    <div class="quickview-info">
      <div>
        <span class="modal-kicker">DICH™ DROP // ${product.category}</span>
        <h3 class="modal-heading" style="margin-bottom:4px;">${product.name}</h3>
        <p class="quickview-price">${formatPrice(product.price)} <span>ARS</span></p>
        <p class="quickview-desc">${product.description}</p>
      </div>

      ${colorSelectorHtml}

      <div>
        <div class="selector-header">
          <span>SELECT SIZE</span>
          <span id="quickViewStockLabel">${stockInfo}</span>
        </div>
        <div class="size-grid" id="sizeGrid">
          ${product.sizes
            .map((size) => {
              const variant = findVariant(product, size, selectedQuickColor);
              const outOfStock = variant && variant.stock <= 0;
              return `
                <button
                  type="button"
                  class="size-pill ${size === selectedQuickSize ? 'active' : ''}"
                  data-action="select-size"
                  data-size="${size}"
                  ${outOfStock ? 'disabled' : ''}
                >
                  ${size}
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <button
        type="button"
        class="btn-brutal-full"
        data-action="modal-add-to-cart"
        ${product.inStock === false ? 'disabled' : ''}
      >
        ${product.inStock === false ? 'SOLD OUT' : `ADD TO CART — ${formatPrice(product.price)}`}
      </button>
    </div>
  `;

  openModal('quickViewModal');
}

function selectColor(color, btnEl) {
  selectedQuickColor = color;
  document.querySelectorAll('#colorGrid .color-pill').forEach((btn) => btn.classList.remove('active'));
  btnEl.classList.add('active');

  const product = products[activeQuickIndex];
  const colorLabel = document.getElementById('quickViewColorLabel');
  if (colorLabel) colorLabel.textContent = color;

  const mainImg = document.getElementById('quickViewMainImg');
  if (mainImg && product) mainImg.src = getColorImage(product, color);

  const variant = findVariant(product, selectedQuickSize, color);
  const stockLabel = document.getElementById('quickViewStockLabel');
  if (stockLabel && variant) stockLabel.textContent = `STOCK: ${variant.stock} UNITS`;
}

function selectSize(size, btnEl) {
  selectedQuickSize = size;
  document.querySelectorAll('#sizeGrid .size-pill').forEach((btn) => btn.classList.remove('active'));
  btnEl.classList.add('active');

  const product = products[activeQuickIndex];
  const variant = findVariant(product, size, selectedQuickColor);
  const stockLabel = document.getElementById('quickViewStockLabel');
  if (stockLabel && variant) stockLabel.textContent = `STOCK: ${variant.stock} UNITS`;
}

// ==========================================================================
// SHOPPING CART & PROMO CODES (POST /api/promo-codes/validate)
// ==========================================================================
function quickAddToCart(index) {
  const product = products[index];
  if (!product || product.inStock === false) return;
  const colors = getProductColors(product);
  const defaultColor = colors.length > 0 ? colors[0].color : null;
  addToCart(index, getDefaultAvailableSize(product, defaultColor), defaultColor);
}

function addToCart(index, size, color = null) {
  const product = products[index];
  if (!product) return;

  const variant = findVariant(product, size, color);
  const resolvedColor = color || variant?.color || null;
  if (variant && variant.stock <= 0) {
    showToast(`SIZE ${size} IS OUT OF STOCK`);
    return;
  }

  const existing = cart.find(
    (item) =>
      item.slug === product.slug &&
      item.size === size &&
      (item.color || null) === resolvedColor
  );

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
      color: resolvedColor,
      name: product.name,
      price: variant?.priceOverride ?? product.price,
      image: getColorImage(product, resolvedColor) || product.image,
      size,
      maxStock: variant ? variant.stock : null,
      qty: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  const label = resolvedColor ? `${size} · ${resolvedColor}` : size;
  showToast(`ADDED ${product.name} (${label})`);
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

  if (cart.length === 0) appliedPromo = null;
  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  if (cart.length === 0) appliedPromo = null;
  saveCartToStorage();
  updateCartUI();
}

function calculateCartTotals() {
  const subtotal = Math.round(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
  let discount = 0;

  if (appliedPromo && subtotal > 0) {
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedPromo.discountValue / 100));
    } else if (appliedPromo.discountType === 'fixed') {
      discount = Math.min(subtotal, appliedPromo.discountValue);
    } else {
      discount = Math.min(subtotal, appliedPromo.discountAmount || 0);
    }
  }

  const total = Math.max(0, Math.round(subtotal - discount));
  return { subtotal, discount, total };
}

async function applyPromoCode() {
  const promoInput = document.getElementById('promoInput');
  const feedback = document.getElementById('promoFeedback');
  const applyBtn = document.getElementById('applyPromoBtn');
  if (!promoInput || !feedback) return;

  const code = promoInput.value.trim().toUpperCase();
  feedback.classList.remove('is-success', 'is-error');

  if (!code) {
    appliedPromo = null;
    feedback.textContent = '✕ ENTER A PROMO CODE (FIRST15, URBAN10, SNEAKER20)';
    feedback.classList.add('is-error');
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
      discountAmount: result.discountAmount
    };

    const promoLabel =
      result.discountType === 'percentage'
        ? `${result.discountValue}% OFF`
        : `${formatPrice(result.discountValue)} OFF`;

    feedback.textContent = `✓ "${result.code}" APPLIED (${promoLabel})`;
    feedback.classList.add('is-success');
  } catch (err) {
    appliedPromo = null;
    feedback.textContent = `✕ ${err.message.toUpperCase()}`;
    feedback.classList.add('is-error');
  } finally {
    if (applyBtn) applyBtn.disabled = false;
  }

  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const pad = String(totalItems).padStart(2, '0');
  const cartCount = document.getElementById('cartCount');
  const drawerBadge = document.getElementById('drawerCountBadge');
  if (cartCount) cartCount.textContent = pad;
  if (drawerBadge) drawerBadge.textContent = pad;

  const container = document.getElementById('cartItemsContainer');
  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p class="cart-empty-title">BAG IS EMPTY</p>
          <p class="cart-empty-sub">HOVER ANY PIECE AND CLICK ADD TO CART.</p>
        </div>
      `;
    } else {
      container.innerHTML = cart
        .map(
          (item, idx) => `
          <div class="cart-item-card">
            <img src="${item.image}" alt="${item.name}" />
            <div class="cart-item-body">
              <div class="cart-item-top">
                <div>
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-meta">${item.size}${item.color ? ` · ${item.color}` : ''}</div>
                </div>
                <button type="button" class="cart-item-remove" data-action="remove-item" data-index="${idx}" aria-label="Remove">✕</button>
              </div>
              <div class="cart-item-bottom">
                <div class="qty-control">
                  <button type="button" data-action="qty-minus" data-index="${idx}">-</button>
                  <span>${item.qty}</span>
                  <button type="button" data-action="qty-plus" data-index="${idx}">+</button>
                </div>
                <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
              </div>
            </div>
          </div>
        `
        )
        .join('');
    }
  }

  const { subtotal, discount, total } = calculateCartTotals();
  const subEl = document.getElementById('cartSubtotal');
  const totEl = document.getElementById('cartTotal');
  const discRow = document.getElementById('discountRow');
  const discLabel = document.getElementById('discountLabel');
  const discEl = document.getElementById('cartDiscount');

  if (subEl) subEl.textContent = formatPrice(subtotal);
  if (totEl) totEl.textContent = formatPrice(total);

  if (discRow && discEl) {
    if (appliedPromo && discount > 0) {
      discRow.classList.remove('is-hidden');
      if (discLabel) {
        const suffix =
          appliedPromo.discountType === 'percentage'
            ? `-${appliedPromo.discountValue}%`
            : `-${formatPrice(appliedPromo.discountValue)}`;
        discLabel.textContent = `${appliedPromo.code} (${suffix})`;
      }
      discEl.textContent = `-${formatPrice(discount)}`;
    } else {
      discRow.classList.add('is-hidden');
    }
  }
}

// ==========================================================================
// CHECKOUT MODAL (POST /api/orders)
// ==========================================================================
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('ADD A PIECE TO YOUR BAG FIRST');
    return;
  }

  const summaryEl = document.getElementById('checkoutSummary');
  const errorEl = document.getElementById('checkoutError');
  if (errorEl) {
    errorEl.classList.add('is-hidden');
    errorEl.textContent = '';
  }

  const { subtotal, discount, total } = calculateCartTotals();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="checkout-summary-row">
        <span>ITEMS (${totalItems})</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      ${
        appliedPromo && discount > 0
          ? `<div class="checkout-summary-row checkout-summary-discount">
               <span>PROMO (${appliedPromo.code})</span>
               <span>-${formatPrice(discount)}</span>
             </div>`
          : ''
      }
      <div class="checkout-summary-total">
        <span>TOTAL TO PAY (ARS)</span>
        <span>${formatPrice(total)}</span>
      </div>
    `;
  }

  if (currentUser) {
    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    const phoneInput = document.getElementById('checkoutPhone');
    if (nameInput && !nameInput.value) {
      nameInput.value = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    }
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    if (phoneInput && !phoneInput.value && currentUser.phone) phoneInput.value = currentUser.phone;
  }

  closeCart();
  openModal('checkoutModal');
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const form = event.target;
  const errorEl = document.getElementById('checkoutError');
  const submitBtn = document.getElementById('confirmOrderBtn');

  if (errorEl) {
    errorEl.classList.add('is-hidden');
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
      ...(item.color ? { color: item.color } : {}),
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
    if (promoFeedback) promoFeedback.textContent = '';

    form.reset();
    updateCartUI();
    closeModal('checkoutModal');
    showToast(`ORDER #${order.orderNumber} CONFIRMED!`);
    await loadProducts();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'No se pudo procesar la orden. Intentá nuevamente.';
      errorEl.classList.remove('is-hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'CONFIRM ORDER →';
    }
  }
}

// ==========================================================================
// AUTHENTICATION: LOGIN, REGISTER, GOOGLE SIGN-IN & MY ORDERS
// ==========================================================================
function setAuthSession(user, token) {
  currentUser = user;
  authToken = token;
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  updateAuthUI();
}

function showAuthError(message) {
  const errEl = document.getElementById('authError');
  if (!errEl) return;
  if (!message) {
    errEl.classList.add('is-hidden');
    errEl.textContent = '';
    return;
  }
  errEl.textContent = message;
  errEl.classList.remove('is-hidden');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');

  showAuthError('');
  const isRegister = tab === 'register';
  loginForm?.classList.toggle('is-hidden', isRegister);
  registerForm?.classList.toggle('is-hidden', !isRegister);
  tabLogin?.classList.toggle('is-active', !isRegister);
  tabRegister?.classList.toggle('is-active', isRegister);
}

function updateAuthUI() {
  const navLabel = document.getElementById('authNavLabel');
  const navDot = document.getElementById('authNavDot');
  const mobileAuthBtn = document.getElementById('mobileAuthBtn');
  const guestView = document.getElementById('authGuestView');
  const profileView = document.getElementById('authProfileView');
  const profileName = document.getElementById('profileFullName');
  const profileEmail = document.getElementById('profileEmail');

  if (currentUser) {
    const first = (currentUser.firstName || 'CUENTA').toUpperCase();
    if (navLabel) navLabel.textContent = first;
    if (mobileAuthBtn) mobileAuthBtn.textContent = `CUENTA (${first})`;
    navDot?.classList.add('is-active');
    guestView?.classList.add('is-hidden');
    profileView?.classList.remove('is-hidden');
    if (profileName) {
      profileName.textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    }
    if (profileEmail) profileEmail.textContent = currentUser.email || '';
  } else {
    if (navLabel) navLabel.textContent = 'LOGIN';
    if (mobileAuthBtn) mobileAuthBtn.textContent = 'CUENTA / LOGIN';
    navDot?.classList.remove('is-active');
    guestView?.classList.remove('is-hidden');
    profileView?.classList.add('is-hidden');
  }
}

async function loadMyOrders() {
  const listEl = document.getElementById('myOrdersList');
  if (!listEl || !authToken) return;

  listEl.innerHTML = '<p class="orders-empty">Cargando tus órdenes...</p>';
  try {
    const data = await apiRequest('/api/orders/my-orders');
    const orders = Array.isArray(data?.items) ? data.items : [];
    if (orders.length === 0) {
      listEl.innerHTML = '<p class="orders-empty">Todavía no realizaste compras con esta cuenta.</p>';
      return;
    }

    listEl.innerHTML = orders
      .map(
        (order) => `
          <div class="order-card">
            <div class="order-card-top">
              <span>#${order.orderNumber}</span>
              <span class="order-card-price">${formatPrice(order.total)}</span>
            </div>
            <div class="order-card-meta">
              <span>ESTADO: ${String(order.status || 'confirmed').toUpperCase()}</span>
              <span>${order.items?.length || 0} ÍTEM(S)</span>
            </div>
          </div>
        `
      )
      .join('');
  } catch {
    listEl.innerHTML = '<p class="orders-empty">No se pudo cargar el historial de órdenes.</p>';
  }
}

function openAuthModal() {
  showAuthError('');
  updateAuthUI();
  if (currentUser) {
    loadMyOrders();
  } else if (googleClientId && !googleButtonRendered) {
    renderGoogleSignInButton();
  }
  openModal('authModal');
}

async function restoreAuthSession() {
  if (!authToken) {
    updateAuthUI();
    return;
  }
  try {
    const data = await apiRequest('/api/auth/me');
    if (data?.user) {
      currentUser = data.user;
    } else {
      setAuthSession(null, null);
    }
  } catch {
    setAuthSession(null, null);
  }
  updateAuthUI();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  showAuthError('');
  const form = event.target;
  const btn = document.getElementById('loginSubmitBtn');
  const formData = new FormData(form);

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'INGRESANDO...';
  }

  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: String(formData.get('email') || '').trim(),
        password: String(formData.get('password') || '')
      })
    });
    setAuthSession(result.user, result.token);
    form.reset();
    closeModal('authModal');
    showToast(`BIENVENIDO, ${(result.user.firstName || 'MEMBER').toUpperCase()}`);
  } catch (err) {
    showAuthError(err.message || 'No se pudo iniciar sesión.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'INGRESAR →';
    }
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  showAuthError('');
  const form = event.target;
  const btn = document.getElementById('registerSubmitBtn');
  const formData = new FormData(form);

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'CREANDO CUENTA...';
  }

  try {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: String(formData.get('firstName') || '').trim(),
        lastName: String(formData.get('lastName') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim() || undefined,
        password: String(formData.get('password') || '')
      })
    });
    setAuthSession(result.user, result.token);
    form.reset();
    closeModal('authModal');
    showToast(`CUENTA CREADA — HOLA ${(result.user.firstName || '').toUpperCase()}`);
  } catch (err) {
    showAuthError(err.message || 'No se pudo registrar la cuenta.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'CREAR CUENTA →';
    }
  }
}

async function handleGoogleCredentialResponse(response) {
  showAuthError('');
  if (!response?.credential) {
    showAuthError('No se recibió el token de Google.');
    return;
  }

  try {
    const result = await apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: response.credential })
    });
    setAuthSession(result.user, result.token);
    closeModal('authModal');
    showToast(`SESIÓN CON GOOGLE ACTIVA — HOLA ${(result.user.firstName || '').toUpperCase()}`);
  } catch (err) {
    showAuthError(err.message || 'No se pudo iniciar sesión con Google.');
  }
}

function renderGoogleSignInButton() {
  const container = document.getElementById('googleSignInContainer');
  const hint = document.getElementById('googleSignInHint');
  if (!container) return;

  if (!googleClientId) {
    container.innerHTML = '';
    hint?.classList.remove('is-hidden');
    return;
  }

  hint?.classList.add('is-hidden');
  if (window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse
    });
    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      width: 280
    });
    googleButtonRendered = true;
  }
}

async function initGoogleSignIn() {
  try {
    const config = await apiRequest('/api/auth/config');
    googleClientId = config?.googleEnabled ? config.googleClientId : null;
  } catch {
    googleClientId = null;
  }

  renderGoogleSignInButton();
  if (googleClientId && !googleButtonRendered) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      renderGoogleSignInButton();
      if (googleButtonRendered || attempts >= 20) clearInterval(timer);
    }, 300);
  }
}

function handleLogout() {
  setAuthSession(null, null);
  closeModal('authModal');
  showToast('SESIÓN CERRADA');
}

// ==========================================================================
// NEWSLETTER (POST /api/newsletter/subscribe) & URBAN MODE
// ==========================================================================
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
      msg.textContent = `✓ ${result.message || 'SUBSCRIBED — USE CODE FIRST15 FOR 15% OFF YOUR FIRST ORDER.'}`;
      msg.classList.remove('is-error');
    }
    form.reset();
  } catch (err) {
    if (msg) {
      msg.textContent = `✕ ${err.message || 'Error al suscribirse al newsletter.'}`;
      msg.classList.add('is-error');
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function toggleUrbanMode() {
  const on = document.body.classList.toggle('urban-mode');
  const label = document.getElementById('urbanLabel');
  if (label) label.textContent = on ? 'URBAN MODE: ON' : 'URBAN MODE';
  showToast(on ? 'URBAN NIGHT MODE ON' : 'EDITORIAL LIGHT MODE');
}

// ==========================================================================
// INITIALIZATION & EVENT DELEGATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTopSecretTape();
  loadProducts();
  updateCartUI();
  restoreAuthSession();
  initGoogleSignIn();

  // Briefly play SHOP NOW burst rays intro
  setTimeout(() => {
    document.getElementById('shopNowCta')?.classList.remove('burst-intro');
  }, 2400);

  // Switch header tint smoothly when scrolling past hero
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    const hero = document.getElementById('hero');
    if (!nav) return;
    const threshold = hero ? hero.offsetHeight - 90 : 500;
    nav.classList.toggle('scrolled', window.scrollY >= threshold);
  });

  // Navbar & mobile drawer
  document.getElementById('urbanModeBtn')?.addEventListener('click', toggleUrbanMode);
  document.getElementById('authNavBtn')?.addEventListener('click', openAuthModal);
  document.getElementById('mobileAuthBtn')?.addEventListener('click', openAuthModal);
  document.getElementById('cartNavBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('mobileDrawer')?.classList.toggle('open');
  });
  document.querySelectorAll('[data-close-mobile]').forEach((el) => {
    el.addEventListener('click', () => {
      document.getElementById('mobileDrawer')?.classList.remove('open');
    });
  });

  // Editorial & Featured interactions
  document.getElementById('lookbookPrevBtn')?.addEventListener('click', () => cycleLookbook(-1));
  document.getElementById('lookbookNextBtn')?.addEventListener('click', () => cycleLookbook(1));
  document.getElementById('destroyMeBtn')?.addEventListener('click', pulseCrack);
  document.getElementById('allProductsBtn')?.addEventListener('click', toggleAllProducts);
  document.getElementById('buyShoesCta')?.addEventListener('click', () => {
    filterProducts('sneakers');
  });

  // Category filters
  document.querySelectorAll('#categoryFilters .filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => filterProducts(btn.dataset.filter));
  });

  // Cart & checkout
  document.getElementById('applyPromoBtn')?.addEventListener('click', applyPromoCode);
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
  document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckoutSubmit);

  // Auth forms & tabs
  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchAuthTab(btn.dataset.authTab));
  });
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegisterSubmit);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', handleNewsletter);

  // Modal close buttons & backdrop click
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });

  // Escape key closes modals & cart drawer
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeCart();
    ['quickViewModal', 'checkoutModal', 'authModal'].forEach(closeModal);
  });

  // Delegated actions for dynamic cards, quick-view & cart
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
      case 'select-color':
        selectColor(target.dataset.color, target);
        break;
      case 'select-size':
        selectSize(target.dataset.size, target);
        break;
      case 'modal-add-to-cart':
        addToCart(activeQuickIndex, selectedQuickSize, selectedQuickColor);
        closeModal('quickViewModal');
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

  // Image fallback handler
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (img instanceof HTMLImageElement && img.dataset.fallback && img.src !== img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
    },
    true
  );
});

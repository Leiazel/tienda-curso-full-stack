'use strict';

// ==========================================================================
// DICH® STREETWEAR — CATALOG DATA & APPLICATION LOGIC
// ==========================================================================

const PRODUCTS = [
  {
    id: 'dich-hoodie-01',
    badge: 'AVAILABLE 28/250',
    name: 'DICH® BOXY HEAVYWEIGHT HOODIE',
    subtitle: '480GSM Washed Black French Terry · Drop Shoulder',
    price: 110,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    description:
      'Cut in a boxy cropped silhouette from custom 480GSM organic French terry. Features vintage charcoal enzyme wash, double-lined hood, and puff-print DICH® chest branding.'
  },
  {
    id: 'dich-cargo-02',
    badge: 'AVAILABLE 19/250',
    name: 'PARACHUTE CARGO PANTS V2',
    subtitle: 'Technical Cotton-Nylon Ripstop · 8 Utility Pockets',
    price: 135,
    category: 'pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    description:
      'Articulated knee pleats, adjustable ankle bungee toggles, and heavy-duty matte black hardware. Engineered for relaxed stacked draping over bulky sneakers.'
  },
  {
    id: 'dich-tee-03',
    badge: 'AVAILABLE 42/250',
    name: 'ACID WASH GRAPHIC TEE',
    subtitle: '300GSM Heavy Jersey · Brutalist Screenprint',
    price: 58,
    category: 'tees',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    description:
      'Sun-faded acid wash heavyweight cotton tee with thick high-ribbed collar and distressed neon-pink & white archive screenprint across chest and back.'
  },
  {
    id: 'dich-bomber-04',
    badge: 'AVAILABLE 12/250',
    name: 'DISTRESSED VARSITY BOMBER',
    subtitle: 'Heavyweight Twill & Chenille Patches · Quilted Lining',
    price: 210,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    description:
      'Oversized cropped varsity bomber jacket featuring hand-distressed rib trims, custom chenille DICH® emblems, two-way YKK® metal zipper, and satin diamond lining.'
  },
  {
    id: 'dich-sneaker-05',
    badge: 'AVAILABLE 15/250',
    name: 'DICH® LOW-TOP SNEAKER "CONCRETE"',
    subtitle: 'Full-Grain Leather & Suede · Sculpted Cup Sole',
    price: 165,
    category: 'sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    sizes: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
    defaultSize: 'US 9.5',
    description:
      'Hand-lasted low-top skate & street silhouette crafted with supple full-grain leather, hairy suede overlays, padded fat tongue, and custom DICH® tread outsole.'
  },
  {
    id: 'dich-utility-06',
    badge: 'AVAILABLE 34/250',
    name: 'UTILITY CROSSBODY BAG & BEANIE SET',
    subtitle: 'Cordura® Ballistic Sling + Ribbed Knit Beanie',
    price: 65,
    category: 'outerwear',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
    sizes: ['ONE SIZE'],
    defaultSize: 'ONE SIZE',
    description:
      'Two-piece tactical street bundle pairing a weatherproof 1000D Cordura® crossbody pouch with a heavyweight fisherman knit beanie with woven DICH® label.'
  }
];

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let cart = [];
let activeFilter = 'all';
let promoApplied = false;
let selectedQuickSize = 'L';
let activeQuickIndex = 0;

let quickViewModalInstance = null;
let cartOffcanvasInstance = null;
let toastInstance = null;

// ==========================================================================
// RENDER PRODUCT CATALOG (BOOTSTRAP 5 GRID)
// ==========================================================================
function renderProducts() {
  const feed = document.getElementById('productFeed');
  if (!feed) return;

  const filtered =
    activeFilter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === activeFilter);

  feed.innerHTML = filtered
    .map((product) => {
      const originalIndex = PRODUCTS.findIndex((p) => p.id === product.id);
      const fallbackUrl = `https://placehold.co/800x840/141414/FFFFFF?text=${encodeURIComponent(
        product.name
      )}`;

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
              >
                <div class="animate-marquee-fast text-nowrap font-display fs-6 tracking-wider text-uppercase d-flex align-items-center">
                  <span class="mx-3">⚡ ADD TO CART</span>
                  <span class="mx-3 text-dich-pink">⚡ ADD TO CART</span>
                  <span class="mx-3">⚡ ADD TO CART</span>
                  <span class="mx-3 text-dich-pink">⚡ ADD TO CART</span>
                  <span class="mx-3">⚡ ADD TO CART</span>
                  <span class="mx-3 text-dich-pink">⚡ ADD TO CART</span>
                </div>
              </button>

              <span class="size-badge-overlay font-mono-tech shadow-sm">
                SIZES: ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}
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
                  <span class="font-mono-tech fw-bold fs-5 flex-shrink-0">$${product.price}</span>
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
                >
                  + BAG
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
  const product = PRODUCTS[index];
  if (!product) return;

  activeQuickIndex = index;
  selectedQuickSize = product.defaultSize;

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
          DICH® DROP 04 // ${product.category}
        </span>
        <h3 class="font-display fs-2 text-uppercase mt-1 mb-0 lh-1">${product.name}</h3>
        <p class="font-mono-tech fs-4 fw-bold text-dich-pink mt-2 mb-0">$${product.price}</p>
        <p class="small text-secondary lh-base mt-3 mb-0" style="font-size: 0.78rem;">
          ${product.description}
        </p>
      </div>

      <div>
        <div class="d-flex justify-content-between fw-bold text-uppercase mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          <span>SELECT SIZE</span>
          <span class="text-secondary">BOXY STREET FIT</span>
        </div>
        <div class="row g-2" id="sizeGrid">
          ${product.sizes
            .map(
              (size) => `
                <div class="col-3">
                  <button
                    type="button"
                    class="size-btn w-100 font-mono-tech ${
                      size === selectedQuickSize ? 'is-selected' : ''
                    }"
                    data-action="select-size"
                    data-size="${size}"
                  >
                    ${size}
                  </button>
                </div>
              `
            )
            .join('')}
        </div>
      </div>

      <button
        type="button"
        class="btn btn-dich-primary w-100 shadow"
        data-action="modal-add-to-cart"
      >
        ADD TO CART — $${product.price}
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
}

// ==========================================================================
// SHOPPING CART & OFFCANVAS DRAWER (BOOTSTRAP 5 OFFCANVAS)
// ==========================================================================
function quickAddToCart(index) {
  const product = PRODUCTS[index];
  if (!product) return;
  addToCart(index, product.defaultSize);
}

function addToCart(index, size) {
  const product = PRODUCTS[index];
  if (!product) return;

  const existing = cart.find((item) => item.id === product.id && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1
    });
  }

  updateCartUI();
  showToast(`ADDED ${product.name} (${size})`);
}

function updateQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  updateCartUI();
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  updateCartUI();
}

function applyPromoCode() {
  const promoInput = document.getElementById('promoInput');
  const feedback = document.getElementById('promoFeedback');
  if (!promoInput || !feedback) return;

  const code = promoInput.value.trim().toUpperCase();
  feedback.classList.remove('d-none', 'text-success', 'text-danger');

  if (code === 'FIRST15') {
    promoApplied = true;
    feedback.textContent = '✓ PROMO CODE "FIRST15" APPLIED (15% OFF)';
    feedback.classList.add('text-success', 'fw-bold');
  } else {
    promoApplied = false;
    feedback.textContent = '✕ INVALID CODE. TRY "FIRST15"';
    feedback.classList.add('text-danger', 'fw-bold');
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
                <span class="font-mono-tech fw-bold small">$${item.price * item.qty}</span>
              </div>
            </div>
          </div>
        `
        )
        .join('');
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;

  const subtotalEl = document.getElementById('cartSubtotal');
  const discountRow = document.getElementById('discountRow');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
  if (totalEl) totalEl.textContent = `$${total}`;

  if (discountRow && discountEl) {
    if (promoApplied && subtotal > 0) {
      discountRow.classList.remove('d-none');
      discountRow.classList.add('d-flex');
      discountEl.textContent = `-$${discount}`;
    } else {
      discountRow.classList.add('d-none');
      discountRow.classList.remove('d-flex');
    }
  }
}

function simulateCheckout() {
  if (cart.length === 0) {
    showToast('ADD A STREETWEAR PIECE FIRST!');
    return;
  }

  const orderNum = Math.floor(100000 + Math.random() * 900000);
  cart = [];
  promoApplied = false;

  const promoInput = document.getElementById('promoInput');
  const promoFeedback = document.getElementById('promoFeedback');
  if (promoInput) promoInput.value = '';
  if (promoFeedback) promoFeedback.classList.add('d-none');

  updateCartUI();
  cartOffcanvasInstance?.hide();
  showToast(`ORDER #DICH-${orderNum} CONFIRMED! 🔥`);
}

// ==========================================================================
// URBAN MODE, NEWSLETTER, TOAST & PARALLAX
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

function handleNewsletter(event) {
  event.preventDefault();
  const msg = document.getElementById('newsletterMsg');
  if (msg) {
    msg.textContent = '✓ WELCOME TO DICH®. USE CODE "FIRST15" AT CHECKOUT FOR 15% OFF.';
    msg.classList.remove('d-none');
  }
  event.target.reset();
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
  const offcanvasEl = document.getElementById('cartDrawer');
  const toastEl = document.getElementById('toastNotification');

  if (modalEl && window.bootstrap) {
    quickViewModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  }
  if (offcanvasEl && window.bootstrap) {
    cartOffcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  }
  if (toastEl && window.bootstrap) {
    toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2800 });
  }

  // Render initial catalog & cart state
  renderProducts();
  updateCartUI();

  // Category filter pills
  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => filterProducts(btn.dataset.filter));
  });

  // Urban mode toggle
  document.getElementById('urbanModeBtn')?.addEventListener('click', toggleUrbanMode);

  // Promo code apply & checkout buttons
  document.getElementById('applyPromoBtn')?.addEventListener('click', applyPromoCode);
  document.getElementById('checkoutBtn')?.addEventListener('click', simulateCheckout);

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

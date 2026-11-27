import { useCallback, useEffect, useRef, useState } from 'react'
import { products as fallbackProducts } from './data/products.js'
import {
  apiRequest,
  findVariant,
  formatPrice,
  getColorImage,
  getDefaultAvailableSize,
  getProductColors,
  getStoredToken,
  loadStoredCart,
  normalizeProduct,
  saveStoredCart,
  setStoredToken,
} from './api/client.js'
import AuthModal from './components/AuthModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import QuickViewModal from './components/QuickViewModal.jsx'
import AboutPage from './pages/AboutPage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LookbookPage from './pages/LookbookPage.jsx'

const pages = {
  home: HomePage,
  catalog: CatalogPage,
  about: AboutPage,
  lookbook: LookbookPage,
  contact: ContactPage,
}

export default function App({ page = 'home' }) {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.toLowerCase().replace('#', '')
    if (hash === 'catalog' || hash === 'catalogo' || hash === 'tienda') return 'catalog'
    if (hash === 'contact' || hash === 'contacto') return 'contact'
    if (hash === 'about' || hash === 'nosotros') return 'about'
    if (hash === 'lookbook' || hash === 'lookbooks') return 'lookbook'
    return page || 'home'
  })

  const [products, setProducts] = useState(() => fallbackProducts.map(normalizeProduct))
  const [cart, setCart] = useState(() => loadStoredCart())
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [isCartOpen, setCartOpen] = useState(false)
  const [isAuthOpen, setAuthOpen] = useState(false)
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [urbanMode, setUrbanMode] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [googleClientId, setGoogleClientId] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef()
  const Page = pages[currentPage] ?? HomePage

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const data = await apiRequest('/api/products?limit=50')
      const items = Array.isArray(data?.items) ? data.items : []
      if (items.length > 0) {
        setProducts(items.map(normalizeProduct))
      }
    } catch {
      // Keep fallback products if backend is offline
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      apiRequest('/api/auth/me', { token })
        .then((data) => {
          if (data?.user) setCurrentUser(data.user)
          else setStoredToken(null)
        })
        .catch(() => setStoredToken(null))
    }

    apiRequest('/api/auth/config')
      .then((cfg) => setGoogleClientId(cfg?.googleEnabled ? cfg.googleClientId : null))
      .catch(() => setGoogleClientId(null))
  }, [])

  useEffect(() => {
    saveStoredCart(cart)
  }, [cart])

  function navigate(targetPage) {
    setCurrentPage(targetPage)
    window.location.hash = targetPage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '')
      if (hash === 'catalog' || hash === 'catalogo' || hash === 'tienda') setCurrentPage('catalog')
      else if (hash === 'contact' || hash === 'contacto') setCurrentPage('contact')
      else if (hash === 'about' || hash === 'nosotros') setCurrentPage('about')
      else if (hash === 'lookbook' || hash === 'lookbooks') setCurrentPage('lookbook')
      else if (hash === '' || hash === 'home' || hash === 'inicio') setCurrentPage('home')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('urban-mode', urbanMode)
    return () => document.body.classList.remove('urban-mode')
  }, [urbanMode])

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('mainNav')
      const hero = document.getElementById('hero')
      if (nav) nav.classList.toggle('scrolled', !hero || window.scrollY >= hero.offsetHeight - 90)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setQuickViewProduct(null)
        setCartOpen(false)
        setAuthOpen(false)
        setCheckoutOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function addToCart(product, size, color = null) {
    if (!product || product.inStock === false) return
    const colors = getProductColors(product)
    const resolvedColor = color || (colors.length > 0 ? colors[0].color : null)
    const resolvedSize = size || getDefaultAvailableSize(product, resolvedColor)
    const variant = findVariant(product, resolvedSize, resolvedColor)

    if (variant && variant.stock <= 0) {
      showToast(`TALLE ${resolvedSize} SIN STOCK`)
      return
    }

    let limitHit = false
    setCart((currentCart) => {
      const slug = product.slug || product.id
      const existing = currentCart.find(
        (item) =>
          (item.slug || item.id) === slug &&
          item.size === resolvedSize &&
          (item.color || null) === resolvedColor,
      )
      if (existing) {
        if (variant && existing.qty >= variant.stock) {
          limitHit = true
          return currentCart
        }
        return currentCart.map((item) =>
          (item.slug || item.id) === slug &&
          item.size === resolvedSize &&
          (item.color || null) === resolvedColor
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }
      return [
        ...currentCart,
        {
          id: product.id,
          slug,
          variantId: variant?.id ?? null,
          color: resolvedColor,
          title: product.title,
          subtitle: product.subtitle,
          price: variant?.priceOverride ?? product.price,
          image: getColorImage(product, resolvedColor) || product.image,
          size: resolvedSize,
          maxStock: variant ? variant.stock : null,
          qty: 1,
        },
      ]
    })

    if (limitHit) {
      showToast(`STOCK MÁXIMO ALCANZADO (${variant.stock})`)
    } else {
      const label = resolvedColor ? `${resolvedSize} · ${resolvedColor}` : resolvedSize
      showToast(`AGREGADO ${product.title} (${label})`)
    }
  }

  function updateQuantity(slugOrId, size, color, delta) {
    setCart((currentCart) => {
      const next = currentCart
        .map((item) => {
          if (
            (item.slug || item.id) !== slugOrId ||
            item.size !== size ||
            (item.color || null) !== (color || null)
          ) {
            return item
          }
          const nextQty = item.qty + delta
          if (item.maxStock != null && nextQty > item.maxStock) {
            showToast(`SOLO ${item.maxStock} EN STOCK PARA ${item.size}`)
            return item
          }
          return { ...item, qty: nextQty }
        })
        .filter((item) => item.qty > 0)
      if (next.length === 0) setAppliedPromo(null)
      return next
    })
  }

  function removeItem(slugOrId, size, color) {
    setCart((currentCart) => {
      const next = currentCart.filter(
        (item) =>
          (item.slug || item.id) !== slugOrId ||
          item.size !== size ||
          (item.color || null) !== (color || null),
      )
      if (next.length === 0) setAppliedPromo(null)
      return next
    })
  }

  const subtotal = Math.round(cart.reduce((sum, item) => sum + item.price * item.qty, 0))
  let discount = 0
  if (appliedPromo && subtotal > 0) {
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedPromo.discountValue / 100))
    } else if (appliedPromo.discountType === 'fixed') {
      discount = Math.min(subtotal, appliedPromo.discountValue)
    } else {
      discount = Math.min(subtotal, appliedPromo.discountAmount || 0)
    }
  }
  const total = Math.max(0, Math.round(subtotal - discount))

  async function handleApplyPromo(rawCode) {
    const code = rawCode.trim().toUpperCase()
    if (!code) {
      setAppliedPromo(null)
      return { valid: false, message: 'INGRESÁ UN CÓDIGO (FIRST15, URBAN10, SNEAKER20)' }
    }
    try {
      const result = await apiRequest('/api/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      })
      setAppliedPromo({
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: result.discountAmount,
      })
      const label =
        result.discountType === 'percentage'
          ? `${result.discountValue}% OFF`
          : `${formatPrice(result.discountValue)} OFF`
      return { valid: true, message: `✓ "${result.code}" APLICADO (${label})` }
    } catch (err) {
      setAppliedPromo(null)
      return { valid: false, message: `✕ ${(err.message || 'CÓDIGO INVÁLIDO').toUpperCase()}` }
    }
  }

  function handleOpenCheckout() {
    if (cart.length === 0) {
      showToast('AGREGÁ UN PRODUCTO PRIMERO')
      return
    }
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  async function handleOrderConfirmed(order) {
    setCart([])
    setAppliedPromo(null)
    setCheckoutOpen(false)
    showToast(`PEDIDO #${order.orderNumber} CONFIRMADO`)
    await loadProducts()
  }

  const handleAuthSuccess = useCallback(
    (user, token, message) => {
      setCurrentUser(user)
      setStoredToken(token)
      if (message) showToast(message)
    },
    [showToast],
  )

  function handleLogout() {
    setCurrentUser(null)
    setStoredToken(null)
    showToast('SESIÓN CERRADA')
  }

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)
  const pageProducts = currentPage === 'home' ? products.slice(0, 4) : products

  return (
    <>
      <Navbar
        activePage={currentPage}
        cartCount={cartCount}
        urbanMode={urbanMode}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onToggleUrbanMode={() => {
          setUrbanMode((current) => !current)
          showToast(urbanMode ? 'MODO CLARO EDITORIAL' : 'MODO NOCHE URBANO ACTIVADO')
        }}
        onNavigate={navigate}
      />
      <Page
        products={pageProducts}
        onAddToCart={addToCart}
        onQuickView={setQuickViewProduct}
        onToast={showToast}
        onNavigate={navigate}
      />
      <Footer onNavigate={navigate} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
      />
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        appliedPromo={appliedPromo}
        subtotal={subtotal}
        discount={discount}
        total={total}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onApplyPromo={handleApplyPromo}
        onCheckout={handleOpenCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        appliedPromo={appliedPromo}
        subtotal={subtotal}
        discount={discount}
        total={total}
        currentUser={currentUser}
        onClose={() => setCheckoutOpen(false)}
        onOrderConfirmed={handleOrderConfirmed}
      />
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        googleClientId={googleClientId}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />
      <div className={`toast-banner${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

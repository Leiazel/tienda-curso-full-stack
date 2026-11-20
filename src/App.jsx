import { useEffect, useRef, useState } from 'react'
import { products } from './data/products.js'
import CartDrawer from './components/CartDrawer.jsx'
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
  const [cart, setCart] = useState([])
  const [promoApplied, setPromoApplied] = useState(false)
  const [isCartOpen, setCartOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [urbanMode, setUrbanMode] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef()
  const Page = pages[currentPage] ?? HomePage

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

  function showToast(message) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2500)
  }

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
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function addToCart(product, size = product.defaultSize) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id && item.size === size)
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id && item.size === size ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...currentCart, { ...product, size, qty: 1 }]
    })
    showToast(`AGREGADO ${product.title} (${size})`)
  }

  function updateQuantity(productId, size, delta) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId && item.size === size
            ? { ...item, qty: item.qty + delta }
            : item,
        )
        .filter((item) => item.qty > 0),
    )
  }

  function checkout() {
    if (cart.length === 0) {
      showToast('AGREGÁ UN PRODUCTO PRIMERO')
      return
    }
    const orderId = Math.floor(10000 + Math.random() * 90000)
    setCart([])
    setPromoApplied(false)
    setCartOpen(false)
    showToast(`PEDIDO #LD-${orderId} CONFIRMADO`)
  }

  const cartCount = cart.reduce((total, item) => total + item.qty, 0)

  return (
    <>
      <Navbar
        activePage={currentPage}
        cartCount={cartCount}
        urbanMode={urbanMode}
        onOpenCart={() => setCartOpen(true)}
        onToggleUrbanMode={() => {
          setUrbanMode((current) => !current)
          showToast(urbanMode ? 'MODO CLARO EDITORIAL' : 'MODO NOCHE URBANO ACTIVADO')
        }}
        onNavigate={navigate}
      />
      <Page
        products={products}
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
        promoApplied={promoApplied}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={(id, size) =>
          setCart((currentCart) => currentCart.filter((item) => item.id !== id || item.size !== size))
        }
        onApplyPromo={(code) => {
          setPromoApplied(code.trim().toUpperCase() === 'FIRST15')
          return code.trim().toUpperCase() === 'FIRST15'
        }}
        onCheckout={checkout}
      />
      <div className={`toast-banner${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

import { useState } from 'react'
import PromoBar from './PromoBar.jsx'

const links = [
  { label: 'TIENDA', page: 'catalog' },
  { label: 'NOSOTROS', page: 'about' },
  { label: 'LOOKBOOKS', page: 'lookbook' },
  { label: 'CONTACTO', page: 'contact' },
]

export default function Navbar({
  activePage,
  cartCount,
  urbanMode,
  currentUser,
  onOpenAuth,
  onOpenCart,
  onToggleUrbanMode,
  onNavigate,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const authLabel = currentUser ? (currentUser.firstName || 'CUENTA').toUpperCase() : 'INGRESAR'

  return (
    <div className="sticky-chrome">
      <PromoBar />
      <header id="mainNav" className="main-nav">
        <nav className="nav-links" aria-label="Navegación principal">
          {links.map((link) => (
            <a
              className={activePage === link.page ? 'active' : ''}
              href={`#${link.page}`}
              key={link.label}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault()
                  onNavigate(link.page)
                }
              }}
              aria-current={activePage === link.page ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobileDrawer"
        >
          {mobileMenuOpen ? 'CERRAR' : 'MENÚ'}
        </button>
        <a
          href="#home"
          className="nav-logo-pill"
          aria-label="Inicio L&D"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault()
              onNavigate('home')
            }
          }}
        >
          L&amp;D<sup>™</sup>
        </a>
        <div className="nav-right">
          <button type="button" onClick={onToggleUrbanMode}>
            <span className="urban-active-dot" aria-hidden="true" />
            <span>{urbanMode ? 'MODO URBANO: ON' : 'MODO URBANO'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenAuth}
            aria-label={currentUser ? 'Ver mi cuenta y órdenes' : 'Iniciar sesión o registrarse'}
          >
            <span className={`auth-active-dot${currentUser ? ' active' : ''}`} aria-hidden="true" />
            <span>{authLabel}</span>
          </button>
          <button type="button" onClick={onOpenCart} aria-label={`Abrir carrito, ${cartCount} productos`}>
            CARRITO:<span>{String(cartCount).padStart(2, '0')}</span>
          </button>
        </div>
      </header>
      <nav
        id="mobileDrawer"
        className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`}
        aria-label="Navegación móvil"
      >
        {links.map((link) => (
          <a
            href={`#${link.page}`}
            key={link.label}
            onClick={(e) => {
              setMobileMenuOpen(false)
              if (onNavigate) {
                e.preventDefault()
                onNavigate(link.page)
              }
            }}
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          className="mobile-auth-link"
          onClick={() => {
            setMobileMenuOpen(false)
            onOpenAuth?.()
          }}
        >
          {currentUser ? `CUENTA (${authLabel})` : 'INICIAR SESIÓN / REGISTRARSE'}
        </button>
      </nav>
    </div>
  )
}

import { useState } from 'react'

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer id="footer" className="site-footer">
      <div className="footer-inner">
        <div>
          <a
            href="#home"
            className="nav-logo-pill"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('home')
              }
            }}
          >
            L&amp;D<sup>™</sup>
          </a>
          <h2 className="font-wide-left footer-brand-title">
            ABRAZA LO QUE TE HACE <span>L&amp;D.</span>
          </h2>
        </div>
        <div>
          <label className="footer-newsletter-label" htmlFor="newsletterEmail">
            SUSCRIBITE Y OBTENÉ 15% OFF EN TU PRIMERA COMPRA — CÓDIGO: FIRST15
          </label>
          <form className="footer-form" onSubmit={handleSubmit}>
            <input
              id="newsletterEmail"
              type="email"
              required
              placeholder="INGRESÁ TU EMAIL..."
              aria-label="Correo electrónico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit">UNIRME AL DROP</button>
          </form>
          {subscribed && (
            <p className="newsletter-feedback" role="status">
              ✓ ¡SUSCRIPCIÓN EXITOSA! USÁ EL CÓDIGO FIRST15 PARA UN 15% DE DESCUENTO EN TU PRIMERA COMPRA.
            </p>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>©2025 L&amp;D™ — CALZADO ARTESANAL EN MATERIALES NATURALES</span>
        <nav className="footer-links" aria-label="Navegación de pie de página">
          <a
            href="#home"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('home')
              }
            }}
          >
            ARRIBA ↑
          </a>
          <a
            href="#catalog"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('catalog')
              }
            }}
          >
            TIENDA
          </a>
          <a
            href="#about"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('about')
              }
            }}
          >
            NOSOTROS
          </a>
          <a
            href="#lookbook"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('lookbook')
              }
            }}
          >
            LOOKBOOKS
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate('contact')
              }
            }}
          >
            CONTACTO
          </a>
        </nav>
      </div>
    </footer>
  )
}

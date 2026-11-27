import { useState } from 'react'
import { apiRequest } from '../api/client.js'

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail) return

    setSubmitting(true)
    setFeedback('')
    setIsError(false)

    try {
      const result = await apiRequest('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      })
      setFeedback(
        `✓ ${result.message || '¡SUSCRIPCIÓN EXITOSA! USÁ EL CÓDIGO FIRST15 PARA 15% OFF.'}`,
      )
      setEmail('')
    } catch (err) {
      setIsError(true)
      setFeedback(`✕ ${err.message || 'No se pudo completar la suscripción.'}`)
    } finally {
      setSubmitting(false)
    }
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
            <button type="submit" disabled={submitting}>
              {submitting ? 'ENVIANDO...' : 'UNIRME AL DROP'}
            </button>
          </form>
          {feedback && (
            <p className={`newsletter-feedback${isError ? ' is-error' : ''}`} role="status">
              {feedback}
            </p>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>©2026 L&amp;D™ — CALZADO E INDUMENTARIA EN MATERIALES NATURALES</span>
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

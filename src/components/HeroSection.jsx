import { useEffect, useState } from 'react'
import { heroImage } from '../data/products.js'

export default function HeroSection() {
  const [introAnimation, setIntroAnimation] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroAnimation(false), 2400)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <section id="hero" className="hero-section halftone-overlay">
      <div className="hanging-sneaker hanging-sneaker-left" aria-hidden="true">
        <img src={heroImage} alt="Zapatillas colgantes L&D" />
      </div>
      <div className="hanging-sneaker hanging-sneaker-right" aria-hidden="true">
        <img src={heroImage} alt="Zapatillas colgantes L&D" />
      </div>

      <div className="hero-center">
        <div className="hero-typography">
          <div className="hero-line-1">
            <span className="font-wide textured-espresso">ABRAZA</span>
            <span className="hero-tag hero-tag-freedom">LIBERTAD</span>
            <span className="hero-tag hero-tag-spirit">ESPÍRITU</span>
          </div>
          <div className="hero-line-2">
            <span className="font-condensed textured-espresso">LO QUE TE HACE</span>
          </div>
          <div className="hero-line-3-wrap">
            <svg className="hero-crown" viewBox="0 0 64 42" fill="none" stroke="currentColor">
              <path d="M8 34L6 12L22 24L32 7L42 24L58 12L54 34H8Z" />
              <path d="M7 36H55" />
            </svg>
            <h1 className="font-condensed hero-line-3">L&amp;D</h1>
            <span className="hero-tag hero-tag-tm">TM</span>
          </div>
        </div>

        <a href="#featured" className={`shop-now-cta${introAnimation ? ' burst-intro' : ''}`}>
          <span className="shop-now-row">
            <svg className="burst-rays left" viewBox="0 0 26 32" fill="none" stroke="currentColor">
              <path d="M20 6L6 2M18 16H3M20 26L7 30" />
            </svg>
            <span className="shop-now-text">COMPRAR AHORA</span>
            <svg className="burst-rays right" viewBox="0 0 26 32" fill="none" stroke="currentColor">
              <path d="M20 6L6 2M18 16H3M20 26L7 30" />
            </svg>
          </span>
          <svg className="yellow-underline-svg" viewBox="0 0 210 18" fill="none">
            <path
              className="yellow-underline-path"
              d="M6 12C68 8 134 6 196 5"
              stroke="#FFE200"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="204" cy="11" r="2.6" fill="#FFE200" />
          </svg>
        </a>
      </div>

      <div className="hero-bottom">
        <span>©2026</span>
        
        <p className="hero-mission">
          CREAMOS LOOKS ÚNICOS QUE FUSIONAN MATERIALES NATURALES CON DISEÑO AUDAZ, PRIORIZANDO LA PRODUCCIÓN LOCAL PARA REDUCIR EL IMPACTO AMBIENTAL.
        </p>
        <div className="hero-socials">
          <a href="#contact">FB</a>
          <a href="#contact">X</a>
          <a href="#contact">IG</a>
        </div>
      </div>
    </section>
  )
}

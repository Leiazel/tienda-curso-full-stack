import { useState } from 'react'
import { lookbookSlides as defaultSlides } from '../data/products.js'
import CautionTape from './CautionTape.jsx'
import Skull from './Skull.jsx'

export default function LookbookSection({ slides = defaultSlides, showTape = true }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const slide = slides[slideIndex] || slides[0]

  function changeSlide(direction) {
    setSlideIndex((index) => (index + direction + slides.length) % slides.length)
  }

  if (!slide) return null

  return (
    <section id="about" className="editorial-section">
      <div className="editorial-top-grid">
        <div className="were-dope-block">
          <div className="were-row">
            <span className="font-wide-left textured-black were-word">SOMOS</span>
            <span className="editorial-tag">URBANO</span>
          </div>
          <div className="dope-row">
            <span className="font-wide-left textured-black dope-word">DOPE</span>
            <span className="editorial-tag editorial-tag-bold">AUDAZ</span>
          </div>
        </div>
        <div className="skate-photo-wrap">
          <img src={slides[1]?.image || slide.image} alt="Skater realizando un ollie en skatepark" />
        </div>
      </div>

      <div id="lookbook" className="editorial-lower-grid">
        <div className="editorial-left-col">
          <p className="editorial-caption">
            AQUÍ, CADA PIEZA CUENTA UNA HISTORIA, FUSIONANDO ARTE Y MODA URBANA.
          </p>
          <div className="editorial-doodle" aria-hidden="true">
            <Skull size={68} />
          </div>
          <div className="topdown-photo-wrap">
            <img src={slides[2]?.image || slide.image} alt="Calzado L&amp;D, visto desde arriba" />
          </div>
        </div>

        <div className="lookbook-center-col">
          <div className="lookbook-photo-stage">
            <button
              type="button"
              className="lookbook-arrow-btn prev"
              onClick={() => changeSlide(-1)}
              aria-label="Foto anterior del lookbook"
            >
              ‹
            </button>
            <div className="lookbook-photo-box">
              <img src={slide.image} alt={slide.line1} />
            </div>
            <button
              type="button"
              className="lookbook-arrow-btn next"
              onClick={() => changeSlide(1)}
              aria-label="Siguiente foto del lookbook"
            >
              ›
            </button>
          </div>
          <div className="limited-overlay-wrap">
            <span className="limited-tag">LIMITADO</span>
            <span className="only-1500-white">{slide.line1}</span>
            <span className="for-this-drop-black">{slide.line2}</span>
          </div>
        </div>

        <div className="editorial-right-col">
          <p className="editorial-caption editorial-caption-right">
            CREANDO NARRATIVAS ÚNICAS MEDIANTE LANZAMIENTOS DE EDICIÓN LIMITADA
          </p>
          <a href="#catalog" className="buy-shoes-cta">
            <span className="buy-shoes-text">COMPRAR CALZADO</span>
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
      </div>
      {showTape && <CautionTape />}
    </section>
  )
}

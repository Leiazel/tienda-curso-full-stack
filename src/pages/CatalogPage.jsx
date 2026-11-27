import { useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'

const CATEGORIES = [
  { id: 'all', label: 'TODOS' },
  { id: 'sneakers', label: 'ZAPATILLAS' },
  { id: 'hoodies', label: 'HOODIES' },
  { id: 'pants', label: 'PANTALONES' },
  { id: 'tees', label: 'REMERAS' },
  { id: 'outerwear', label: 'OUTERWEAR' },
  { id: 'accessories', label: 'ACCESORIOS' },
]

export default function CatalogPage({ products, onAddToCart, onQuickView }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <main className="catalog-page">
      <header className="catalog-header container">
        <p className="catalog-eyebrow">L&amp;D™ DROP 04 / INDUMENTARIA &amp; CALZADO EN SERIES PEQUEÑAS</p>
        <h1 className="font-wide-left textured-black">LA COLECCIÓN</h1>
        <p className="editorial-caption">
          DISEÑOS DE EDICIÓN LIMITADA. MATERIALES NATURALES. HECHOS PARA MARCAR LA DIFERENCIA.
        </p>
        <div className="catalog-filters d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`catalog-filter-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.id === 'all' ? `${cat.label} (${products.length})` : cat.label}
            </button>
          ))}
        </div>
      </header>
      <section id="featured" className="catalog-products container">
        <div className="catalog-section-heading">
          <h2 className="font-wide-left textured-black">LANZAMIENTO DESTACADO</h2>
          <span>{filtered.length} PRODUCTOS</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-5">
            <p className="font-wide-left mb-1">SIN PRODUCTOS EN ESTA CATEGORÍA</p>
            <p className="editorial-caption mx-auto mt-2">PROBA SELECCIONANDO OTRA CATEGORÍA DEL DROP.</p>
          </div>
        ) : (
          <div className="row g-4 catalog-grid">
            {filtered.map((product) => (
              <div className="col-12 col-md-6 col-xl-4" key={product.slug || product.id}>
                <ProductCard
                  product={product}
                  extra={product.extra}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

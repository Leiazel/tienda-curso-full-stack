import ProductCard from './ProductCard.jsx'

export default function FeaturedSection({
  products = [],
  onAddToCart,
  onQuickView,
  title = 'DESTACADOS',
  caption = 'CREANDO NARRATIVAS ÚNICAS MEDIANTE LANZAMIENTOS DE EDICIÓN LIMITADA',
  linkText = 'TODOS LOS PRODUCTOS',
  linkHref = '#catalog',
}) {
  return (
    <section id="featured" className="featured-section">
      <div className="featured-grid">
        <div className="featured-sticky-left">
          <div>
            <div className="featured-heading-row">
              <h2 className="font-wide-left textured-black featured-title">{title}</h2>
              <span className="featured-arrow" aria-hidden="true">
                →
              </span>
            </div>
            <p className="editorial-caption featured-caption">{caption}</p>
          </div>
          <div className="destroy-me-block">
            <span className="font-tag destroy-me-label">DESTRÚYEME</span>
            <svg
              className="destroy-crack-svg"
              viewBox="0 0 110 130"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M74 4L56 32L60 44L40 66L45 84L72 96L94 124" />
              <path d="M40 66L16 74M72 96L54 114M72 96L92 84" />
            </svg>
          </div>
          <a className="all-products-btn" href={linkHref}>
            <span className="all-products-text">{linkText}</span>
            <span className="all-products-arrow" aria-hidden="true">
              ⟵ ⟶
            </span>
          </a>
        </div>
        <div className="product-stack">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

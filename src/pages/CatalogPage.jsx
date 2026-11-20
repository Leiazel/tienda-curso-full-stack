import ProductCard from '../components/ProductCard.jsx'

export default function CatalogPage({ products, onAddToCart, onQuickView }) {
  return (
    <main className="catalog-page">
      <header className="catalog-header container">
        <p className="catalog-eyebrow">L&amp;D™ DROP 001 / CALZADO EN SERIES PEQUEÑAS</p>
        <h1 className="font-wide-left textured-black">LA COLECCIÓN</h1>
        <p className="editorial-caption">
          CUATRO DISEÑOS DE EDICIÓN LIMITADA. MATERIALES NATURALES. HECHOS PARA MARCAR LA DIFERENCIA.
        </p>
        <div className="catalog-filters d-flex flex-wrap gap-2" aria-label="Detalles de la colección">
          <span className="badge text-bg-dark">EDICIÓN LIMITADA</span>
          <span className="badge text-bg-light">MATERIALES NATURALES</span>
          <span className="badge text-bg-light">PRODUCCIÓN LOCAL</span>
        </div>
      </header>
      <section id="featured" className="catalog-products container">
        <div className="catalog-section-heading">
          <h2 className="font-wide-left textured-black">LANZAMIENTO DESTACADO</h2>
          <span>{products.length} PRODUCTOS</span>
        </div>
        <div className="row g-4 catalog-grid">
          {products.map((product) => (
            <div className="col-12 col-md-6 col-xl-4" key={product.id}>
              <ProductCard
                product={product}
                extra={product.extra}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

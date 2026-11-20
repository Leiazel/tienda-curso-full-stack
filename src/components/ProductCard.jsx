import Skull from './Skull.jsx'

function Ribbon() {
  const ribbon = Array.from({ length: 5 }, (_, index) => (
    <span className="ribbon-item" key={index}>
      <Skull />
      <span>AGREGAR AL CARRITO</span>
    </span>
  ))

  return (
    <div className="marquee-track-fast" aria-hidden="true">
      <div className="ribbon-track">{ribbon}</div>
      <div className="ribbon-track">{ribbon}</div>
    </div>
  )
}

export default function ProductCard({ product, onQuickView, onAddToCart, extra = false }) {
  return (
    <article className={`product-card${extra ? ' hidden-extra revealed' : ''}`}>
      <span className="torn-badge">{product.badge}</span>
      <div className="product-media-box">
        <img src={product.image} alt={`${product.title} - ${product.subtitle}`} />
        <button
          type="button"
          className="product-media-trigger"
          onClick={() => onQuickView(product)}
          aria-label={`Ver detalles de ${product.title}`}
        />
        <button
          type="button"
          className="add-to-cart-ribbon"
          onClick={(event) => {
            event.stopPropagation()
            onAddToCart(product)
          }}
          aria-label={`Agregar ${product.title} al carrito`}
        >
          <Ribbon />
        </button>
      </div>
      <div className="product-meta">
        <button className="product-meta-title" type="button" onClick={() => onQuickView(product)}>
          <span>{product.title}</span>
          <span className="product-meta-sub">{product.subtitle}</span>
        </button>
        <span className="product-meta-price">${product.price}</span>
      </div>
    </article>
  )
}

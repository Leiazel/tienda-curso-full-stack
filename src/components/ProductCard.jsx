import Skull from './Skull.jsx'
import { formatPrice, getProductColors } from '../api/client.js'

function Ribbon({ soldOut }) {
  const label = soldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'
  const ribbon = Array.from({ length: 5 }, (_, index) => (
    <span className="ribbon-item" key={index}>
      <Skull />
      <span>{label}</span>
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
  const isSoldOut = product.inStock === false
  const colors = getProductColors(product)

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
          disabled={isSoldOut}
          onClick={(event) => {
            event.stopPropagation()
            onAddToCart(product)
          }}
          aria-label={`Agregar ${product.title} al carrito`}
        >
          <Ribbon soldOut={isSoldOut} />
        </button>
      </div>
      <div className="product-meta">
        <button className="product-meta-title" type="button" onClick={() => onQuickView(product)}>
          <span>{product.title}</span>
          <span className="product-meta-sub">{product.subtitle}</span>
          {colors.length > 1 && (
            <span className="product-swatches">
              {colors.map((c) => (
                <span
                  key={c.color}
                  className="swatch-dot"
                  title={c.color}
                  style={{ background: c.colorHex }}
                />
              ))}
              <span className="swatch-count">{colors.length} COLORES</span>
            </span>
          )}
        </button>
        <span className="product-meta-price">{formatPrice(product.price)}</span>
      </div>
    </article>
  )
}

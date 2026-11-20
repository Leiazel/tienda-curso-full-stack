import { useEffect, useState } from 'react'

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    if (product) setSelectedSize(product.defaultSize)
  }, [product])

  if (!product) return null

  return (
    <div
      className="modal-backdrop open"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quickViewTitle">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar vista rápida">
          ×
        </button>
        <div className="modal-product-image">
          <img src={product.image} alt={product.title} />
          <span className="torn-badge">{product.badge}</span>
        </div>
        <div className="modal-product-copy">
          <div>
            <span className="modal-eyebrow">L&amp;D™ DROP // {product.subtitle}</span>
            <h2 id="quickViewTitle">{product.title}</h2>
            <p className="modal-price">${product.price}</p>
            <p className="modal-description">{product.description}</p>
          </div>
          <div>
            <span className="size-label">SELECCIONAR TALLE</span>
            <div className="size-grid">
              {product.sizes.map((size) => (
                <button
                  type="button"
                  className={`size-pill${selectedSize === size ? ' active' : ''}`}
                  key={size}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-dark modal-add-button"
            onClick={() => {
              onAddToCart(product, selectedSize)
              onClose()
            }}
          >
            AGREGAR AL CARRITO — ${product.price}
          </button>
        </div>
      </section>
    </div>
  )
}

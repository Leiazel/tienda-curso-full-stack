import { useEffect, useState } from 'react'
import {
  findVariant,
  formatPrice,
  getColorImage,
  getDefaultAvailableSize,
  getProductColors,
} from '../api/client.js'

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    if (!product) return
    const colors = getProductColors(product)
    const initialColor = colors.length > 0 ? colors[0].color : null
    setSelectedColor(initialColor)
    setSelectedSize(getDefaultAvailableSize(product, initialColor))
  }, [product])

  if (!product) return null

  const colors = getProductColors(product)
  const activeImage = getColorImage(product, selectedColor) || product.image
  const activeVariant = findVariant(product, selectedSize, selectedColor)
  const stockLabel = activeVariant
    ? `STOCK: ${activeVariant.stock} UNID.`
    : (product.fit || '').toUpperCase()

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
          <img src={activeImage} alt={product.title} />
          <span className="torn-badge">{product.badge}</span>
        </div>
        <div className="modal-product-copy">
          <div>
            <span className="modal-eyebrow">L&amp;D™ DROP // {product.subtitle}</span>
            <h2 id="quickViewTitle">{product.title}</h2>
            <p className="modal-price">{formatPrice(product.price)} <small>ARS</small></p>
            <p className="modal-description">{product.description}</p>
          </div>

          {colors.length > 1 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="size-label mb-0">SELECCIONAR COLOR</span>
                <span className="size-stock-label">{selectedColor}</span>
              </div>
              <div className="color-grid">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c.color}
                    className={`color-pill${selectedColor === c.color ? ' active' : ''}`}
                    onClick={() => setSelectedColor(c.color)}
                  >
                    <span className="color-pill-dot" style={{ background: c.colorHex }} />
                    <span>{c.color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="size-label mb-0">SELECCIONAR TALLE</span>
              <span className="size-stock-label">{stockLabel}</span>
            </div>
            <div className="size-grid">
              {product.sizes.map((size) => {
                const variant = findVariant(product, size, selectedColor)
                const outOfStock = variant && variant.stock <= 0
                return (
                  <button
                    type="button"
                    className={`size-pill${selectedSize === size ? ' active' : ''}`}
                    key={size}
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-dark modal-add-button"
            disabled={product.inStock === false}
            onClick={() => {
              onAddToCart(product, selectedSize, selectedColor)
              onClose()
            }}
          >
            {product.inStock === false
              ? 'AGOTADO'
              : `AGREGAR AL CARRITO — ${formatPrice(product.price)}`}
          </button>
        </div>
      </section>
    </div>
  )
}

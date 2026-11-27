import { useState } from 'react'
import { formatPrice } from '../api/client.js'

export default function CartDrawer({
  cart,
  isOpen,
  appliedPromo,
  subtotal,
  discount,
  total,
  onClose,
  onUpdateQuantity,
  onRemove,
  onApplyPromo,
  onCheckout,
}) {
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [promoValid, setPromoValid] = useState(false)
  const [applying, setApplying] = useState(false)
  const count = cart.reduce((items, item) => items + item.qty, 0)

  async function applyPromo() {
    setApplying(true)
    const result = await onApplyPromo(promoCode)
    setPromoValid(result.valid)
    setPromoMessage(result.message)
    setApplying(false)
  }

  return (
    <>
      <button
        type="button"
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-label="Cerrar carrito"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`} aria-label="Carrito de compras">
        <div className="cart-drawer-header">
          <div className="cart-title">
            <span>TU CARRITO</span>
            <span className="cart-badge">{String(count).padStart(2, '0')}</span>
          </div>
          <button className="cart-close" type="button" onClick={onClose} aria-label="Cerrar carrito">
            ×
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>EL CARRITO ESTÁ VACÍO</p>
              <span>EXPLORA LOS MODELOS Y HAZ CLIC EN AGREGAR AL CARRITO.</span>
            </div>
          ) : (
            cart.map((item) => {
              const key = `${item.slug || item.id}-${item.size}-${item.color || ''}`
              return (
                <article className="cart-item" key={key}>
                  <img src={item.image} alt={item.title} />
                  <div className="cart-item-content">
                    <div className="cart-item-heading">
                      <div>
                        <strong>{item.title}</strong>
                        <span>
                          {item.size}
                          {item.color ? ` · ${item.color}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.slug || item.id, item.size, item.color)}
                        aria-label={`Eliminar ${item.title}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.slug || item.id, item.size, item.color, -1)}
                          aria-label={`Reducir cantidad de ${item.title}`}
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.slug || item.id, item.size, item.color, 1)}
                          aria-label={`Aumentar cantidad de ${item.title}`}
                        >
                          +
                        </button>
                      </div>
                      <strong>{formatPrice(item.price * item.qty)}</strong>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
        <div className="cart-summary">
          <div className="promo-entry input-group">
            <input
              className="form-control"
              type="text"
              placeholder="CUPÓN (FIRST15, URBAN10, SNEAKER20)"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              aria-label="Código de descuento"
            />
            <button type="button" className="btn btn-dark" onClick={applyPromo} disabled={applying}>
              {applying ? '...' : 'APLICAR'}
            </button>
          </div>
          {promoMessage && (
            <p className={`promo-message${promoValid ? ' valid' : ''}`} role="status">
              {promoMessage}
            </p>
          )}
          <div className="cart-total-line">
            <span>SUBTOTAL</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedPromo && discount > 0 && (
            <div className="cart-total-line discount-line">
              <span>
                {appliedPromo.code} (
                {appliedPromo.discountType === 'percentage'
                  ? `-${appliedPromo.discountValue}%`
                  : `-${formatPrice(appliedPromo.discountValue)}`}
                )
              </span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="cart-total-line cart-grand-total">
            <strong>TOTAL</strong>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button type="button" className="btn btn-dark checkout-button" onClick={onCheckout}>
            FINALIZAR COMPRA →
          </button>
        </div>
      </aside>
    </>
  )
}

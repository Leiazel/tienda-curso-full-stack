import { useState } from 'react'

export default function CartDrawer({
  cart,
  isOpen,
  promoApplied,
  onClose,
  onUpdateQuantity,
  onRemove,
  onApplyPromo,
  onCheckout,
}) {
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [promoValid, setPromoValid] = useState(false)
  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0)
  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0
  const total = subtotal - discount
  const count = cart.reduce((items, item) => items + item.qty, 0)

  function applyPromo() {
    const valid = onApplyPromo(promoCode)
    setPromoValid(valid)
    setPromoMessage(
      valid ? '✓ FIRST15 APLICADO (15% DE DESCUENTO)' : 'CÓDIGO INVÁLIDO — PRUEBA FIRST15',
    )
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
            cart.map((item) => (
              <article className="cart-item" key={`${item.id}-${item.size}`}>
                <img src={item.image} alt={item.title} />
                <div className="cart-item-content">
                  <div className="cart-item-heading">
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.subtitle} · {item.size}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id, item.size)}
                      aria-label={`Eliminar ${item.title}`}
                    >
                      ×
                    </button>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.size, -1)}
                        aria-label={`Reducir cantidad de ${item.title}`}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.size, 1)}
                        aria-label={`Aumentar cantidad de ${item.title}`}
                      >
                        +
                      </button>
                    </div>
                    <strong>${item.price * item.qty}</strong>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <div className="cart-summary">
          <div className="promo-entry input-group">
            <input
              className="form-control"
              type="text"
              placeholder="CÓDIGO DE DESCUENTO (FIRST15)"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              aria-label="Código de descuento"
            />
            <button type="button" className="btn btn-dark" onClick={applyPromo}>
              APLICAR
            </button>
          </div>
          {promoMessage && (
            <p className={`promo-message${promoValid ? ' valid' : ''}`} role="status">
              {promoMessage}
            </p>
          )}
          <div className="cart-total-line">
            <span>SUBTOTAL</span>
            <span>${subtotal}</span>
          </div>
          {promoApplied && subtotal > 0 && (
            <div className="cart-total-line discount-line">
              <span>FIRST15 (-15%)</span>
              <span>-${discount}</span>
            </div>
          )}
          <div className="cart-total-line cart-grand-total">
            <strong>TOTAL</strong>
            <strong>${total}</strong>
          </div>
          <button type="button" className="btn btn-dark checkout-button" onClick={onCheckout}>
            FINALIZAR COMPRA →
          </button>
        </div>
      </aside>
    </>
  )
}

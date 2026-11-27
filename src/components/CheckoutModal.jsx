import { useState } from 'react'
import { apiRequest, formatPrice } from '../api/client.js'

export default function CheckoutModal({
  isOpen,
  cart,
  appliedPromo,
  subtotal,
  discount,
  total,
  currentUser,
  onClose,
  onOrderConfirmed,
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const defaultName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : ''

  async function handleSubmit(event) {
    event.preventDefault()
    if (cart.length === 0) return

    setError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)

    const payload = {
      customerName: String(formData.get('customerName') || '').trim(),
      customerEmail: String(formData.get('customerEmail') || '').trim(),
      customerPhone: String(formData.get('customerPhone') || '').trim() || undefined,
      shippingAddress: String(formData.get('shippingAddress') || '').trim(),
      shippingCity: String(formData.get('shippingCity') || '').trim(),
      shippingPostalCode: String(formData.get('shippingPostalCode') || '').trim() || undefined,
      paymentMethod: String(formData.get('paymentMethod') || 'mercadopago'),
      promoCode: appliedPromo?.code || undefined,
      items: cart.map((item) => ({
        ...(item.variantId ? { variantId: item.variantId } : {}),
        slug: item.slug || item.id,
        size: item.size,
        ...(item.color ? { color: item.color } : {}),
        quantity: item.qty,
      })),
    }

    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      onOrderConfirmed(order)
    } catch (err) {
      setError(err.message || 'No se pudo procesar la orden. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop open"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="modal-card modal-card-single" role="dialog" aria-modal="true" aria-labelledby="checkoutModalTitle">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar checkout">
          ×
        </button>

        <div className="modal-panel">
          <span className="modal-eyebrow">CHECKOUT // PEDIDO SEGURO</span>
          <h2 id="checkoutModalTitle" className="modal-panel-title">COMPLETÁ TU PEDIDO</h2>

          <div className="checkout-summary-box">
            <div className="cart-total-line">
              <span>PRODUCTOS ({totalItems})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedPromo && discount > 0 && (
              <div className="cart-total-line discount-line">
                <span>CUPÓN ({appliedPromo.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="cart-total-line cart-grand-total mb-0">
              <strong>TOTAL A PAGAR (ARS)</strong>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {error}
            </div>
          )}

          <form className="brutal-modal-form" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="checkoutName">NOMBRE COMPLETO *</label>
                <input id="checkoutName" name="customerName" type="text" className="form-control" required minLength={2} defaultValue={defaultName} placeholder="Sofía Martínez" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="checkoutEmail">EMAIL *</label>
                <input id="checkoutEmail" name="customerEmail" type="email" className="form-control" required defaultValue={currentUser?.email || ''} placeholder="sofia@example.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="checkoutPhone">TELÉFONO</label>
                <input id="checkoutPhone" name="customerPhone" type="tel" className="form-control" defaultValue={currentUser?.phone || ''} placeholder="+54 11 5555-1234" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="checkoutPayment">MÉTODO DE PAGO *</label>
                <select id="checkoutPayment" name="paymentMethod" className="form-select" required defaultValue="mercadopago">
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="card">Tarjeta de crédito / débito</option>
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="cash">Efectivo</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="checkoutAddress">DIRECCIÓN DE ENVÍO *</label>
                <input id="checkoutAddress" name="shippingAddress" type="text" className="form-control" required minLength={4} placeholder="Av. Corrientes 1234" />
              </div>
              <div className="col-md-7">
                <label className="form-label" htmlFor="checkoutCity">CIUDAD *</label>
                <input id="checkoutCity" name="shippingCity" type="text" className="form-control" required minLength={2} placeholder="Buenos Aires" />
              </div>
              <div className="col-md-5">
                <label className="form-label" htmlFor="checkoutPostalCode">CÓDIGO POSTAL</label>
                <input id="checkoutPostalCode" name="shippingPostalCode" type="text" className="form-control" placeholder="1043" />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                  {submitting ? 'PROCESANDO PEDIDO...' : 'CONFIRMAR PEDIDO →'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

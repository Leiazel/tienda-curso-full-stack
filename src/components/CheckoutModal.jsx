import { useEffect, useRef, useState } from 'react'
import { apiRequest, extractFieldErrors, formatPrice } from '../api/client.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  onViewOrders,
}) {
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setConfirmedOrder(null)
      setError('')
      setFieldErrors({})
      submittingRef.current = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const defaultName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : ''

  function clearFieldError(name) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function validatePayload(payload) {
    const errors = {}
    if (!payload.customerName || payload.customerName.length < 2) {
      errors.customerName = 'Ingresá tu nombre completo (mínimo 2 caracteres).'
    }
    if (!payload.customerEmail || !EMAIL_REGEX.test(payload.customerEmail)) {
      errors.customerEmail = 'Ingresá un correo electrónico válido.'
    }
    if (!payload.shippingAddress || payload.shippingAddress.length < 4) {
      errors.shippingAddress = 'Ingresá una dirección de envío válida (mínimo 4 caracteres).'
    }
    if (!payload.shippingCity || payload.shippingCity.length < 2) {
      errors.shippingCity = 'Ingresá tu ciudad.'
    }
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (cart.length === 0 || submittingRef.current || submitting) return

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

    const validationErrors = validatePayload(payload)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError('Revisá los campos marcados antes de confirmar tu pedido.')
      return
    }

    setError('')
    setFieldErrors({})
    submittingRef.current = true
    setSubmitting(true)

    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setConfirmedOrder(order)
      onOrderConfirmed?.(order)
    } catch (err) {
      const apiFieldErrors = extractFieldErrors(err)
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors)
      }
      setError(err.message || 'No se pudo procesar la orden. Intentá nuevamente.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop open"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section className="modal-card modal-card-single" role="dialog" aria-modal="true" aria-labelledby="checkoutModalTitle">
        <button className="modal-close" type="button" onClick={onClose} disabled={submitting} aria-label="Cerrar checkout">
          ×
        </button>

        {confirmedOrder ? (
          <div className="modal-panel order-confirmed-panel">
            <span className="modal-eyebrow modal-eyebrow-pink">PEDIDO CONFIRMADO // L&amp;D™</span>
            <h2 id="checkoutModalTitle" className="modal-panel-title">
              GRACIAS POR TU COMPRA
            </h2>
            <div className="order-confirmed-badge">
              <span>NÚMERO DE ORDEN</span>
              <strong>#{confirmedOrder.orderNumber}</strong>
            </div>

            <div className="checkout-summary-box">
              <div className="order-confirmed-section-title">RESUMEN DE ÍTEMS</div>
              <div className="order-confirmed-items">
                {(confirmedOrder.items || []).map((item, idx) => (
                  <div className="order-confirmed-item" key={item.id || `${item.sku || idx}-${idx}`}>
                    <div>
                      <strong>{item.productName}</strong>
                      <span>
                        {item.size}
                        {item.color ? ` · ${item.color}` : ''} × {item.quantity}
                      </span>
                    </div>
                    <strong>{formatPrice(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>
              {confirmedOrder.discountAmount > 0 && (
                <div className="cart-total-line discount-line mt-2">
                  <span>DESCUENTO ({confirmedOrder.promoCode || 'PROMO'})</span>
                  <span>-{formatPrice(confirmedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="cart-total-line cart-grand-total mb-0 mt-2">
                <strong>TOTAL PAGADO (ARS)</strong>
                <strong>{formatPrice(confirmedOrder.total)}</strong>
              </div>
            </div>

            <div className="order-confirmed-shipping">
              <div className="order-confirmed-section-title">DIRECCIÓN DE ENVÍO</div>
              <p className="mb-1"><strong>{confirmedOrder.customerName}</strong></p>
              <p className="mb-1">
                {confirmedOrder.shippingAddress} — {confirmedOrder.shippingCity}
                {confirmedOrder.shippingPostalCode ? ` (${confirmedOrder.shippingPostalCode})` : ''}
              </p>
              <p className="mb-0 order-confirmed-email">{confirmedOrder.customerEmail}</p>
            </div>

            <div className="order-confirmed-actions">
              <button
                type="button"
                className="btn btn-dark modal-add-button"
                onClick={() => {
                  if (onViewOrders) onViewOrders()
                  else onClose()
                }}
              >
                VER MIS ÓRDENES →
              </button>
              <button
                type="button"
                className="btn btn-outline-dark modal-add-button"
                onClick={onClose}
              >
                SEGUIR COMPRANDO
              </button>
            </div>
          </div>
        ) : (
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

            <form className="brutal-modal-form" noValidate onSubmit={handleSubmit}>
              <fieldset disabled={submitting} className="row g-3 border-0 p-0 m-0">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkoutName">NOMBRE COMPLETO *</label>
                  <input
                    id="checkoutName"
                    name="customerName"
                    type="text"
                    className={`form-control${fieldErrors.customerName ? ' is-invalid' : ''}`}
                    required
                    minLength={2}
                    defaultValue={defaultName}
                    placeholder="Sofía Martínez"
                    onChange={() => clearFieldError('customerName')}
                  />
                  {fieldErrors.customerName && (
                    <div className="invalid-feedback d-block">{fieldErrors.customerName}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkoutEmail">EMAIL *</label>
                  <input
                    id="checkoutEmail"
                    name="customerEmail"
                    type="email"
                    className={`form-control${fieldErrors.customerEmail ? ' is-invalid' : ''}`}
                    required
                    defaultValue={currentUser?.email || ''}
                    placeholder="sofia@example.com"
                    onChange={() => clearFieldError('customerEmail')}
                  />
                  {fieldErrors.customerEmail && (
                    <div className="invalid-feedback d-block">{fieldErrors.customerEmail}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkoutPhone">TELÉFONO</label>
                  <input
                    id="checkoutPhone"
                    name="customerPhone"
                    type="tel"
                    className={`form-control${fieldErrors.customerPhone ? ' is-invalid' : ''}`}
                    defaultValue={currentUser?.phone || ''}
                    placeholder="+54 11 5555-1234"
                    onChange={() => clearFieldError('customerPhone')}
                  />
                  {fieldErrors.customerPhone && (
                    <div className="invalid-feedback d-block">{fieldErrors.customerPhone}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkoutPayment">MÉTODO DE PAGO *</label>
                  <select
                    id="checkoutPayment"
                    name="paymentMethod"
                    className={`form-select${fieldErrors.paymentMethod ? ' is-invalid' : ''}`}
                    required
                    defaultValue="mercadopago"
                    onChange={() => clearFieldError('paymentMethod')}
                  >
                    <option value="mercadopago">Mercado Pago</option>
                    <option value="card">Tarjeta de crédito / débito</option>
                    <option value="transfer">Transferencia bancaria</option>
                    <option value="cash">Efectivo</option>
                  </select>
                  {fieldErrors.paymentMethod && (
                    <div className="invalid-feedback d-block">{fieldErrors.paymentMethod}</div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="checkoutAddress">DIRECCIÓN DE ENVÍO *</label>
                  <input
                    id="checkoutAddress"
                    name="shippingAddress"
                    type="text"
                    className={`form-control${fieldErrors.shippingAddress ? ' is-invalid' : ''}`}
                    required
                    minLength={4}
                    placeholder="Av. Corrientes 1234"
                    onChange={() => clearFieldError('shippingAddress')}
                  />
                  {fieldErrors.shippingAddress && (
                    <div className="invalid-feedback d-block">{fieldErrors.shippingAddress}</div>
                  )}
                </div>
                <div className="col-md-7">
                  <label className="form-label" htmlFor="checkoutCity">CIUDAD *</label>
                  <input
                    id="checkoutCity"
                    name="shippingCity"
                    type="text"
                    className={`form-control${fieldErrors.shippingCity ? ' is-invalid' : ''}`}
                    required
                    minLength={2}
                    placeholder="Buenos Aires"
                    onChange={() => clearFieldError('shippingCity')}
                  />
                  {fieldErrors.shippingCity && (
                    <div className="invalid-feedback d-block">{fieldErrors.shippingCity}</div>
                  )}
                </div>
                <div className="col-md-5">
                  <label className="form-label" htmlFor="checkoutPostalCode">CÓDIGO POSTAL</label>
                  <input
                    id="checkoutPostalCode"
                    name="shippingPostalCode"
                    type="text"
                    className={`form-control${fieldErrors.shippingPostalCode ? ' is-invalid' : ''}`}
                    placeholder="1043"
                    onChange={() => clearFieldError('shippingPostalCode')}
                  />
                  {fieldErrors.shippingPostalCode && (
                    <div className="invalid-feedback d-block">{fieldErrors.shippingPostalCode}</div>
                  )}
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                    {submitting ? 'PROCESANDO PEDIDO...' : 'CONFIRMAR PEDIDO →'}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}

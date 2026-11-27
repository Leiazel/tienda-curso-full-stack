import { useEffect, useRef, useState } from 'react'
import { apiRequest, extractFieldErrors, formatPrice } from '../api/client.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal({
  isOpen,
  currentUser,
  googleClientId,
  onClose,
  onAuthSuccess,
  onLogout,
}) {
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const googleContainerRef = useRef(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setFieldErrors({})
    submittingRef.current = false
    if (currentUser) {
      setLoadingOrders(true)
      apiRequest('/api/orders/my-orders')
        .then((data) => setOrders(Array.isArray(data?.items) ? data.items : []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [isOpen, currentUser])

  function clearFieldError(name) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  useEffect(() => {
    if (!isOpen || currentUser || !googleClientId) return

    const renderGoogle = () => {
      if (!window.google?.accounts?.id || !googleContainerRef.current) return false
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            setError('No se recibió el token de Google.')
            return
          }
          try {
            const result = await apiRequest('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential: response.credential }),
            })
            onAuthSuccess(result.user, result.token, `SESIÓN CON GOOGLE ACTIVA — HOLA ${(result.user.firstName || '').toUpperCase()}`)
            onClose()
          } catch (err) {
            setError(err.message || 'No se pudo iniciar sesión con Google.')
          }
        },
      })
      googleContainerRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleContainerRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 280,
      })
      return true
    }

    if (!renderGoogle()) {
      let attempts = 0
      const timer = window.setInterval(() => {
        attempts += 1
        if (renderGoogle() || attempts >= 20) window.clearInterval(timer)
      }, 300)
      return () => window.clearInterval(timer)
    }
  }, [isOpen, currentUser, googleClientId, onAuthSuccess, onClose])

  if (!isOpen) return null

  async function handleLogin(event) {
    event.preventDefault()
    if (submittingRef.current || submitting) return

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    const errors = {}
    if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Ingresá un email válido.'
    if (!password || password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Revisá tus credenciales antes de continuar.')
      return
    }

    setError('')
    setFieldErrors({})
    submittingRef.current = true
    setSubmitting(true)
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      event.currentTarget.reset()
      onAuthSuccess(result.user, result.token, `BIENVENIDO, ${(result.user.firstName || 'MEMBER').toUpperCase()}`)
      onClose()
    } catch (err) {
      const apiFieldErrors = extractFieldErrors(err)
      if (Object.keys(apiFieldErrors).length > 0) setFieldErrors(apiFieldErrors)
      setError(err.message || 'No se pudo iniciar sesión.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    if (submittingRef.current || submitting) return

    const formData = new FormData(event.currentTarget)
    const firstName = String(formData.get('firstName') || '').trim()
    const lastName = String(formData.get('lastName') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const phone = String(formData.get('phone') || '').trim() || undefined
    const password = String(formData.get('password') || '')

    const errors = {}
    if (!firstName || firstName.length < 2) errors.firstName = 'Mínimo 2 caracteres.'
    if (!lastName || lastName.length < 2) errors.lastName = 'Mínimo 2 caracteres.'
    if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Ingresá un email válido.'
    if (!password || password.length < 6) errors.password = 'Mínimo 6 caracteres.'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Completá los campos obligatorios para crear tu cuenta.')
      return
    }

    setError('')
    setFieldErrors({})
    submittingRef.current = true
    setSubmitting(true)
    try {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
      })
      event.currentTarget.reset()
      onAuthSuccess(result.user, result.token, `CUENTA CREADA — HOLA ${(result.user.firstName || '').toUpperCase()}`)
      onClose()
    } catch (err) {
      const apiFieldErrors = extractFieldErrors(err)
      if (Object.keys(apiFieldErrors).length > 0) setFieldErrors(apiFieldErrors)
      setError(err.message || 'No se pudo registrar la cuenta.')
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
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="modal-card modal-card-single modal-card-narrow" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar cuenta">
          ×
        </button>

        {currentUser ? (
          <div className="modal-panel">
            <span className="modal-eyebrow modal-eyebrow-pink">SESIÓN ACTIVA // L&amp;D™ MEMBER</span>
            <h2 id="authModalTitle" className="modal-panel-title">
              {`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'USUARIO'}
            </h2>
            <p className="modal-panel-sub">{currentUser.email}</p>

            <div className="orders-block">
              <h3 className="orders-title">MIS ÓRDENES</h3>
              <div className="orders-list">
                {loadingOrders ? (
                  <p className="orders-empty">Cargando tus órdenes...</p>
                ) : orders.length === 0 ? (
                  <p className="orders-empty">Todavía no realizaste compras con esta cuenta.</p>
                ) : (
                  orders.map((order) => (
                    <div className="order-item-card" key={order.orderNumber}>
                      <div className="order-item-top">
                        <strong>#{order.orderNumber}</strong>
                        <span className="order-item-price">{formatPrice(order.total)}</span>
                      </div>
                      <div className="order-item-meta">
                        <span>ESTADO: {String(order.status || 'confirmed').toUpperCase()}</span>
                        <span>{order.items?.length || 0} ÍTEM(S)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline-dark modal-add-button"
              onClick={() => {
                onLogout()
                onClose()
              }}
            >
              CERRAR SESIÓN
            </button>
          </div>
        ) : (
          <div className="modal-panel">
            <span className="modal-eyebrow">L&amp;D™ MEMBER ACCESS // DROP 04</span>
            <h2 id="authModalTitle" className="modal-panel-title">TU CUENTA</h2>

            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => {
                  setTab('login')
                  setError('')
                  setFieldErrors({})
                }}
              >
                INICIAR SESIÓN
              </button>
              <button
                type="button"
                className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                onClick={() => {
                  setTab('register')
                  setError('')
                  setFieldErrors({})
                }}
              >
                CREAR CUENTA
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form className="brutal-modal-form" noValidate onSubmit={handleLogin}>
                <fieldset disabled={submitting} className="brutal-modal-form border-0 p-0 m-0">
                  <div>
                    <label className="form-label" htmlFor="loginEmail">EMAIL</label>
                    <input
                      id="loginEmail"
                      name="email"
                      type="email"
                      className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                      required
                      placeholder="cliente@ldstore.com"
                      onChange={() => clearFieldError('email')}
                    />
                    {fieldErrors.email && <div className="invalid-feedback d-block">{fieldErrors.email}</div>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="loginPassword">CONTRASEÑA</label>
                    <input
                      id="loginPassword"
                      name="password"
                      type="password"
                      className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      onChange={() => clearFieldError('password')}
                    />
                    {fieldErrors.password && <div className="invalid-feedback d-block">{fieldErrors.password}</div>}
                  </div>
                  <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                    {submitting ? 'INGRESANDO...' : 'INGRESAR →'}
                  </button>
                </fieldset>
              </form>
            ) : (
              <form className="brutal-modal-form" noValidate onSubmit={handleRegister}>
                <fieldset disabled={submitting} className="brutal-modal-form border-0 p-0 m-0">
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label" htmlFor="registerFirstName">NOMBRE *</label>
                      <input
                        id="registerFirstName"
                        name="firstName"
                        type="text"
                        className={`form-control${fieldErrors.firstName ? ' is-invalid' : ''}`}
                        required
                        minLength={2}
                        placeholder="Ludmila"
                        onChange={() => clearFieldError('firstName')}
                      />
                      {fieldErrors.firstName && <div className="invalid-feedback d-block">{fieldErrors.firstName}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="registerLastName">APELLIDO *</label>
                      <input
                        id="registerLastName"
                        name="lastName"
                        type="text"
                        className={`form-control${fieldErrors.lastName ? ' is-invalid' : ''}`}
                        required
                        minLength={2}
                        placeholder="Ramírez"
                        onChange={() => clearFieldError('lastName')}
                      />
                      {fieldErrors.lastName && <div className="invalid-feedback d-block">{fieldErrors.lastName}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="registerEmail">EMAIL *</label>
                    <input
                      id="registerEmail"
                      name="email"
                      type="email"
                      className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                      required
                      placeholder="tu@email.com"
                      onChange={() => clearFieldError('email')}
                    />
                    {fieldErrors.email && <div className="invalid-feedback d-block">{fieldErrors.email}</div>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="registerPhone">TELÉFONO (OPCIONAL)</label>
                    <input
                      id="registerPhone"
                      name="phone"
                      type="tel"
                      className={`form-control${fieldErrors.phone ? ' is-invalid' : ''}`}
                      placeholder="+54 11 5555-1234"
                      onChange={() => clearFieldError('phone')}
                    />
                    {fieldErrors.phone && <div className="invalid-feedback d-block">{fieldErrors.phone}</div>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="registerPassword">CONTRASEÑA (MÍN. 6) *</label>
                    <input
                      id="registerPassword"
                      name="password"
                      type="password"
                      className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      onChange={() => clearFieldError('password')}
                    />
                    {fieldErrors.password && <div className="invalid-feedback d-block">{fieldErrors.password}</div>}
                  </div>
                  <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                    {submitting ? 'CREANDO CUENTA...' : 'CREAR CUENTA →'}
                  </button>
                </fieldset>
              </form>
            )}

            <div className="google-auth-box">
              <p className="google-auth-label">O CONTINUÁ CON GOOGLE</p>
              <div ref={googleContainerRef} className="d-flex justify-content-center" />
              {!googleClientId && (
                <p className="google-auth-hint">
                  Para activar el botón de Google, agregá <code>GOOGLE_CLIENT_ID</code> en <code>.env</code>.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

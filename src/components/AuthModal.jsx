import { useEffect, useRef, useState } from 'react'
import { apiRequest, formatPrice } from '../api/client.js'

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
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const googleContainerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setError('')
    if (currentUser) {
      setLoadingOrders(true)
      apiRequest('/api/orders/my-orders')
        .then((data) => setOrders(Array.isArray(data?.items) ? data.items : []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [isOpen, currentUser])

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
    setError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: String(formData.get('email') || '').trim(),
          password: String(formData.get('password') || ''),
        }),
      })
      event.currentTarget.reset()
      onAuthSuccess(result.user, result.token, `BIENVENIDO, ${(result.user.firstName || 'MEMBER').toUpperCase()}`)
      onClose()
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    try {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: String(formData.get('firstName') || '').trim(),
          lastName: String(formData.get('lastName') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          phone: String(formData.get('phone') || '').trim() || undefined,
          password: String(formData.get('password') || ''),
        }),
      })
      event.currentTarget.reset()
      onAuthSuccess(result.user, result.token, `CUENTA CREADA — HOLA ${(result.user.firstName || '').toUpperCase()}`)
      onClose()
    } catch (err) {
      setError(err.message || 'No se pudo registrar la cuenta.')
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
              <form className="brutal-modal-form" onSubmit={handleLogin}>
                <div>
                  <label className="form-label" htmlFor="loginEmail">EMAIL</label>
                  <input id="loginEmail" name="email" type="email" className="form-control" required placeholder="cliente@ldstore.com" />
                </div>
                <div>
                  <label className="form-label" htmlFor="loginPassword">CONTRASEÑA</label>
                  <input id="loginPassword" name="password" type="password" className="form-control" required minLength={6} placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                  {submitting ? 'INGRESANDO...' : 'INGRESAR →'}
                </button>
              </form>
            ) : (
              <form className="brutal-modal-form" onSubmit={handleRegister}>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label" htmlFor="registerFirstName">NOMBRE *</label>
                    <input id="registerFirstName" name="firstName" type="text" className="form-control" required minLength={2} placeholder="Ludmila" />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="registerLastName">APELLIDO *</label>
                    <input id="registerLastName" name="lastName" type="text" className="form-control" required minLength={2} placeholder="Ramírez" />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="registerEmail">EMAIL *</label>
                  <input id="registerEmail" name="email" type="email" className="form-control" required placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="form-label" htmlFor="registerPhone">TELÉFONO (OPCIONAL)</label>
                  <input id="registerPhone" name="phone" type="tel" className="form-control" placeholder="+54 11 5555-1234" />
                </div>
                <div>
                  <label className="form-label" htmlFor="registerPassword">CONTRASEÑA (MÍN. 6) *</label>
                  <input id="registerPassword" name="password" type="password" className="form-control" required minLength={6} placeholder="Mínimo 6 caracteres" />
                </div>
                <button type="submit" className="btn btn-dark modal-add-button" disabled={submitting}>
                  {submitting ? 'CREANDO CUENTA...' : 'CREAR CUENTA →'}
                </button>
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

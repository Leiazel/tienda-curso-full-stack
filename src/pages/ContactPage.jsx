import { useState } from 'react'
import { apiRequest } from '../api/client.js'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [validated, setValidated] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setValidated(true)
    setErrorMsg('')
    setSubmitted(false)

    if (!form.checkValidity()) return

    const formData = new FormData(form)
    const fullName = String(formData.get('name') || '').trim()
    const [firstName, ...rest] = fullName.split(/\s+/)
    const lastName = rest.join(' ') || firstName
    const subject = String(formData.get('subject') || '').trim()
    const rawMessage = String(formData.get('message') || '').trim()

    setSubmitting(true)
    try {
      await apiRequest('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email: String(formData.get('email') || '').trim(),
          message: subject ? `[${subject}] ${rawMessage}` : rawMessage,
        }),
      })
      setSubmitted(true)
      form.reset()
      setValidated(false)
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo enviar tu mensaje. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="contact-page">
      <header className="contact-heading">
        <p className="catalog-eyebrow">L&amp;D™ / CONTACTO</p>
        <h1 className="font-wide-left textured-black">HABLEMOS</h1>
        <p className="editorial-caption">
          ¿DUDAS SOBRE UN LANZAMIENTO, TU PEDIDO O SOLO QUERÉS SALUDAR?
        </p>
      </header>
      <div className="container contact-layout">
        <div className="contact-aside">
          <h2 className="font-condensed">LAS BUENAS COSAS EMPIEZAN CON UNA CONVERSACIÓN.</h2>
          <p>
            Nuestro equipo está acá para ayudarte con talles, materiales, estado de pedidos y cualquier consulta.
          </p>
          <a href="mailto:hola@ld.example" className="contact-email">
            HOLA@LD.EXAMPLE
          </a>
        </div>
        <form
          className={`contact-form needs-validation${validated ? ' was-validated' : ''}`}
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="contactName">
                NOMBRE Y APELLIDO
              </label>
              <input className="form-control" id="contactName" name="name" required minLength={2} />
              <div className="invalid-feedback">Por favor ingresá tu nombre.</div>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="contactEmail">
                EMAIL
              </label>
              <input className="form-control" type="email" id="contactEmail" name="email" required />
              <div className="invalid-feedback">Por favor ingresá un correo electrónico válido.</div>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="contactSubject">
                ASUNTO
              </label>
              <select className="form-select" id="contactSubject" name="subject" defaultValue="" required>
                <option value="" disabled>
                  SELECCIONÁ UN TEMA
                </option>
                <option>Talles y productos</option>
                <option>Soporte de pedidos</option>
                <option>Prensa y colaboraciones</option>
                <option>Otro</option>
              </select>
              <div className="invalid-feedback">Por favor seleccioná un tema.</div>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="contactMessage">
                MENSAJE
              </label>
              <textarea
                className="form-control"
                id="contactMessage"
                name="message"
                rows="5"
                minLength={5}
                maxLength={800}
                required
              />
              <div className="invalid-feedback">Por favor escribinos un mensaje (mín. 5 caracteres).</div>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-dark contact-submit" disabled={submitting}>
                {submitting ? 'ENVIANDO...' : 'ENVIAR MENSAJE →'}
              </button>
            </div>
          </div>
          {errorMsg && (
            <div className="alert alert-danger mt-4" role="alert">
              {errorMsg}
            </div>
          )}
          {submitted && (
            <div className="alert alert-success mt-4" role="status">
              ¡Gracias por contactarnos! Tu mensaje fue guardado y te responderemos a la brevedad.
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

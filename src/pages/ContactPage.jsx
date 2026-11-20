import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [validated, setValidated] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setValidated(true)
    if (!form.checkValidity()) {
      setSubmitted(false)
      return
    }

    setSubmitted(true)
    form.reset()
    setValidated(false)
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
                NOMBRE
              </label>
              <input className="form-control" id="contactName" name="name" required />
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
                maxLength="800"
                required
              />
              <div className="invalid-feedback">Por favor escribinos un mensaje.</div>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-dark contact-submit">
                ENVIAR MENSAJE →
              </button>
            </div>
          </div>
          {submitted && (
            <div className="alert alert-success mt-4" role="status">
              ¡Gracias por contactarnos! Te responderemos a la brevedad.
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

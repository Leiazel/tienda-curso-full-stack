'use strict';

const CONTACT_API_BASE_URL = (() => {
    if (typeof window !== 'undefined' && window.API_BASE_URL) {
        return String(window.API_BASE_URL).replace(/\/+$/, '');
    }
    const { protocol, origin, port } = window.location;
    const staticDevPorts = ['5500', '5501', '5173', '8080'];
    if (protocol.startsWith('http') && origin !== 'null' && !staticDevPorts.includes(port)) {
        return '';
    }
    return 'http://localhost:3000';
})();

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach((form) => {
        const inputs = form.querySelectorAll('input, textarea, select');
        const textarea = form.querySelector('#floatingTextarea2');
        const charCounter = form.querySelector('#charCounter');
        const mensajeExito = document.querySelector('#mensajeExito');
        const submitBtn = form.querySelector('button[type="submit"]');

        let mensajeError = document.querySelector('#mensajeError');
        if (!mensajeError && mensajeExito && mensajeExito.parentNode) {
            mensajeError = document.createElement('div');
            mensajeError.id = 'mensajeError';
            mensajeError.className = 'alert alert-danger mt-3 d-none';
            mensajeError.setAttribute('role', 'alert');
            mensajeExito.parentNode.insertBefore(mensajeError, mensajeExito.nextSibling);
        }

        // Solo letras y espacios
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
        // Email con formato y dominio obligatorio (ej: nombre@dominio.com)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        // Contador de caracteres en tiempo real para comentarios
        if (textarea && charCounter) {
            textarea.addEventListener('input', () => {
                charCounter.textContent = `${textarea.value.length} / 250 caracteres`;
            });
        }

        // Valida individualmente cada campo
        const validateField = (field) => {
            const value = field.value.trim();
            let message = '';

            if (!value) {
                message = 'Campo obligatorio';
            } else if (
                (field.id === 'floatingName' || field.id === 'floatingLastName') &&
                (!nameRegex.test(value) || value.length < 2)
            ) {
                message = 'Ingresá al menos 2 letras (sin números ni caracteres especiales)';
            } else if (field.id === 'floatingInput' && !emailRegex.test(value)) {
                message = 'Email inválido';
            } else if (field.id === 'floatingTextarea2' && value.length < 5) {
                message = 'El comentario debe tener al menos 5 caracteres';
            }

            field.setCustomValidity(message);

            const feedbackMap = {
                floatingInput: '#feedbackEmail',
                floatingName: '#feedbackName',
                floatingLastName: '#feedbackLastName',
                floatingTextarea2: '#feedbackComments'
            };
            const feedback = feedbackMap[field.id] ? form.querySelector(feedbackMap[field.id]) : null;

            if (feedback) {
                feedback.textContent = message
                    ? message === 'Campo obligatorio'
                        ? 'Por favor, completá este campo.'
                        : `${message}.`
                    : '';
            }

            field.classList.toggle('is-valid', !message);
            field.classList.toggle('is-invalid', !!message);
        };

        // Valida cada campo mientras el usuario escribe y al salir
        inputs.forEach((field) => {
            field.addEventListener('input', () => validateField(field));
            field.addEventListener('blur', () => validateField(field));
        });

        // Validación y envío al backend (POST /api/contacts)
        form.addEventListener(
            'submit',
            async (event) => {
                inputs.forEach((field) => validateField(field));

                event.preventDefault();
                event.stopPropagation();

                if (mensajeError) {
                    mensajeError.classList.add('d-none');
                    mensajeError.textContent = '';
                }

                if (!form.checkValidity()) {
                    if (mensajeExito) {
                        mensajeExito.classList.add('d-none');
                    }
                    form.classList.add('was-validated');
                    return;
                }

                const payload = {
                    firstName: form.querySelector('#floatingName')?.value.trim() || '',
                    lastName: form.querySelector('#floatingLastName')?.value.trim() || '',
                    email: form.querySelector('#floatingInput')?.value.trim() || '',
                    subject: 'Consulta desde formulario web',
                    message: form.querySelector('#floatingTextarea2')?.value.trim() || ''
                };

                const originalBtnText = submitBtn ? submitBtn.textContent : 'Enviar';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }

                try {
                    const response = await fetch(`${CONTACT_API_BASE_URL}/api/contacts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json().catch(() => null);
                    if (!response.ok) {
                        const detailMessage =
                            Array.isArray(data?.details) && data.details.length > 0
                                ? data.details.map((d) => d.message).join(' · ')
                                : null;
                        throw new Error(detailMessage || data?.message || 'No se pudo enviar el mensaje.');
                    }

                    if (mensajeExito) {
                        mensajeExito.textContent =
                            '¡Gracias! Tu comentario fue enviado y guardado correctamente.';
                        mensajeExito.classList.remove('d-none');
                    }

                    form.reset();
                    if (charCounter) {
                        charCounter.textContent = '0 / 250 caracteres';
                    }
                    form.classList.remove('was-validated');
                    inputs.forEach((field) => {
                        field.classList.remove('is-valid');
                        field.classList.remove('is-invalid');
                    });
                } catch (err) {
                    if (mensajeExito) {
                        mensajeExito.classList.add('d-none');
                    }
                    if (mensajeError) {
                        mensajeError.textContent =
                            err.message || 'Error de conexión con el servidor. Intentá nuevamente.';
                        mensajeError.classList.remove('d-none');
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            },
            false
        );
    });
});
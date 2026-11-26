# tienda-curso-full-stack

Proyecto **Full Stack unificado** (Frontend + Backend REST API + MySQL) para la tienda de indumentaria urbana y calzado (**DICH® / L&D Streetwear & Footwear**) del Curso de Desarrollo Full Stack — Fundación CILSA.

Todo el proyecto vive en este único repositorio: al iniciar el servidor con `npm run dev`, Express sirve automáticamente **el frontend** en `http://localhost:3000` y **la API REST** en `http://localhost:3000/api`.

---

## Estructura del proyecto

```text
tienda-curso-full-stack/
├── public/                 # Frontend (HTML, CSS, JS e imágenes servidos en /)
│   ├── index.html          # Tienda principal + carrito + modal de checkout
│   ├── styles.css          # Estilos brutalist streetwear
│   ├── app.js              # Lógica del frontend conectada a /api/*
│   ├── contacto.html       # Página de contacto
│   ├── contactoValidacion.js # Validación y envío a POST /api/contacts
│   ├── categorias.html     # Vista de categorías
│   └── images/             # Imágenes locales y de productos (/images/products/*)
├── src/                    # Backend Express 5 + MySQL (ESM)
│   ├── app.js              # Configuración de Express (API + static public/)
│   ├── server.js           # Punto de entrada HTTP
│   ├── config/             # Variables de entorno y pool de MySQL
│   ├── controllers/        # Controladores REST
│   ├── db/                 # Scripts de inicialización y seed (init.js, seed.js)
│   ├── middlewares/        # Auth JWT, validaciones y manejo de errores
│   ├── routes/             # Rutas /api/*
│   └── services/           # Lógica de negocio y transacciones MySQL
├── database/
│   ├── schema.sql          # Esquema relacional MySQL (9 tablas)
│   └── seed.sql            # Datos iniciales (productos, talles, cupones, usuarios)
├── tests/                  # Tests automatizados (node --test)
├── docker-compose.yml      # MySQL 8.0 + phpMyAdmin listos para usar
├── .env.example            # Plantilla de variables de entorno
└── package.json
```

---

## Cómo levantar todo en local (paso a paso)

### Requisitos
- **Node.js** `>= 20.0.0`
- **npm**
- **MySQL 8.0+** (local / XAMPP / Laragon / MySQL Workbench) o **Docker**

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá `.env` con tus credenciales de MySQL (`DB_USER`, `DB_PASSWORD`, etc.).

### 3. Levantar y poblar la base de datos MySQL

**Opción A — Con Docker (recomendada):**
```bash
docker compose up -d
```
Levanta MySQL 8.0 en el puerto `3306` con `schema.sql` y `seed.sql` cargados automáticamente (usuario `ld_user`, contraseña `ld_password`, base `ld_store_db`) y **phpMyAdmin** en `http://localhost:8080`.

**Opción B — Con MySQL local / XAMPP / Laragon:**
Asegurate de tener MySQL corriendo y ejecutá:
```bash
npm run db:setup
```

### 4. Iniciar la aplicación completa (Frontend + Backend)

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo estándar
npm start
```

Luego abrí en el navegador:
- **Tienda (Frontend):** `http://localhost:3000`
- **Contacto:** `http://localhost:3000/contacto.html`
- **API REST (índice):** `http://localhost:3000/api`
- **Estado del servidor y DB:** `http://localhost:3000/api/health`

> Si preferís abrir `public/index.html` con **Live Server** (puerto `5500`), el frontend detecta automáticamente el origen y apunta sus llamadas a `http://localhost:3000/api`.

---

## Conexión Frontend ↔ Backend

| Funcionalidad en el Frontend | Endpoint consumido |
|---|---|
| Catálogo de productos, filtros y stock por talle | `GET /api/products?limit=50` |
| Validación de cupones (`FIRST15`, `URBAN10`, `SNEAKER20`) | `POST /api/promo-codes/validate` |
| Checkout y creación de órdenes con descuento de stock | `POST /api/orders` |
| Suscripción al Drop List (Newsletter) | `POST /api/newsletter/subscribe` |
| Formulario de contacto (`contacto.html`) | `POST /api/contacts` |

---

## Scripts disponibles

- `npm run dev`: inicia servidor completo (frontend + API) con recarga automática.
- `npm start`: inicia servidor en modo estándar.
- `npm run db:init`: crea la base de datos y las 9 tablas (`database/schema.sql`).
- `npm run db:seed`: inserta datos iniciales (`database/seed.sql`).
- `npm run db:setup`: ejecuta `db:init` y `db:seed` juntos.
- `npm test`: ejecuta los 25 tests automatizados (`node --test`).

---

## Cuentas de prueba (Seed)

- **Admin:** `admin@ldstore.com` / `Admin1234!`
- **Cliente:** `cliente@ldstore.com` / `Cliente1234!`

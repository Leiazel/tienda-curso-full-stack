const AUTH_TOKEN_KEY = 'ld_store_token_v1'
const CART_STORAGE_KEY = 'ld_store_cart_v1'

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
})

export function formatPrice(amount) {
  const num = Math.round(Number(amount) || 0)
  return `$${ARS_FORMATTER.format(num)}`
}

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
    else localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    // Ignore storage errors
  }
}

export function loadStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Ignore storage errors
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = options.token !== undefined ? options.token : getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const detailMessage =
      Array.isArray(data?.details) && data.details.length > 0
        ? data.details.map((d) => d.message).join(' · ')
        : null
    const error = new Error(detailMessage || data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    error.code = data?.error || 'API_ERROR'
    throw error
  }

  return data
}

export function normalizeProduct(raw) {
  const variants = Array.isArray(raw.variants) ? raw.variants : []
  const sizes =
    Array.isArray(raw.sizes) && raw.sizes.length > 0
      ? raw.sizes
      : [raw.defaultSize || 'ONE SIZE']
  const galleryUrls =
    Array.isArray(raw.galleryUrls) && raw.galleryUrls.length > 0
      ? raw.galleryUrls
      : [raw.image || raw.imageUrl || ''].filter(Boolean)

  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug || String(raw.id),
    badge: raw.badge || (raw.inStock === false ? 'AGOTADO' : 'DISPONIBLE'),
    title: raw.title || raw.name || 'L&D™ PIECE',
    subtitle: raw.subtitle || '',
    price: Number(raw.price) || 0,
    category: raw.category || 'sneakers',
    image: raw.image || raw.imageUrl || '',
    galleryUrls,
    sizes,
    defaultSize: raw.defaultSize || sizes[0],
    fit: raw.fit || 'BOXY STREET FIT',
    variants,
    inStock: raw.inStock !== false,
    description: raw.description || '',
    extra: Boolean(raw.extra),
  }
}

export function getProductColors(product) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return []
  const seen = new Map()
  for (const v of product.variants) {
    if (v.isActive === false || !v.color) continue
    if (!seen.has(v.color)) {
      seen.set(v.color, { color: v.color, colorHex: v.colorHex || '#141414' })
    }
  }
  return Array.from(seen.values())
}

export function getColorImage(product, colorName) {
  if (!product) return ''
  const colors = getProductColors(product)
  const idx = colors.findIndex((c) => c.color === colorName)
  if (idx >= 0 && Array.isArray(product.galleryUrls) && product.galleryUrls[idx]) {
    return product.galleryUrls[idx]
  }
  return product.image
}

export function findVariant(product, size, color = null) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return null
  if (color) {
    const exact = product.variants.find(
      (v) => v.size === size && v.color === color && v.isActive !== false,
    )
    if (exact) return exact
  }
  return product.variants.find((v) => v.size === size && v.isActive !== false) || null
}

export function getDefaultAvailableSize(product, color = null) {
  if (!product) return 'ONE SIZE'
  const defaultVariant = findVariant(product, product.defaultSize, color)
  if (!defaultVariant || defaultVariant.stock > 0) {
    return product.defaultSize || product.sizes[0] || 'ONE SIZE'
  }
  const firstInStock = product.variants.find(
    (v) => v.isActive !== false && v.stock > 0 && (!color || v.color === color),
  )
  return firstInStock ? firstInStock.size : product.defaultSize || product.sizes[0] || 'ONE SIZE'
}

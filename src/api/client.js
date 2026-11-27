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
    error.details = Array.isArray(data?.details) ? data.details : []
    throw error
  }

  return data
}

export function extractFieldErrors(err) {
  const map = {}
  if (Array.isArray(err?.details)) {
    for (const item of err.details) {
      if (item?.field && item?.message && !map[item.field]) {
        map[item.field] = item.message
      }
    }
  }
  return map
}

function inferProductType(category) {
  if (category === 'sneakers') return 'footwear'
  if (category === 'accessories') return 'accessory'
  return 'apparel'
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
  const category = raw.category || 'sneakers'

  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug || String(raw.id),
    badge: raw.badge || (raw.inStock === false ? 'AGOTADO' : 'DISPONIBLE'),
    title: raw.title || raw.name || 'L&D™ PIECE',
    subtitle: raw.subtitle || '',
    material: raw.material || '',
    price: Number(raw.price) || 0,
    category,
    productType: raw.productType || raw.product_type || inferProductType(category),
    image: raw.image || raw.imageUrl || '',
    galleryUrls,
    sizes,
    defaultSize: raw.defaultSize || sizes[0],
    fit: raw.fit || 'BOXY STREET FIT',
    variants,
    inStock: raw.inStock !== false,
    isFeatured: raw.isFeatured !== undefined ? Boolean(raw.isFeatured) : !raw.extra,
    description: raw.description || '',
    extra: Boolean(raw.extra),
  }
}

export async function fetchCatalogProducts(filters = {}, { signal } = {}) {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit || 50))

  if (filters.search && filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.size) params.set('size', filters.size)
  if (filters.minPrice !== '' && filters.minPrice !== undefined && filters.minPrice !== null) {
    params.set('minPrice', String(filters.minPrice))
  }
  if (filters.maxPrice !== '' && filters.maxPrice !== undefined && filters.maxPrice !== null) {
    params.set('maxPrice', String(filters.maxPrice))
  }
  if (filters.inStock) params.set('inStock', 'true')
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort)

  const data = await apiRequest(`/api/products?${params.toString()}`, { signal })
  const items = Array.isArray(data?.items) ? data.items.map(normalizeProduct) : []
  return {
    items,
    total: data?.pagination?.total ?? items.length,
  }
}

export function filterProductsLocally(products = [], filters = {}) {
  const search = (filters.search || '').trim().toLowerCase()
  const minPrice =
    filters.minPrice !== '' && filters.minPrice !== undefined && filters.minPrice !== null
      ? Number(filters.minPrice)
      : null
  const maxPrice =
    filters.maxPrice !== '' && filters.maxPrice !== undefined && filters.maxPrice !== null
      ? Number(filters.maxPrice)
      : null

  const filtered = products.filter((p) => {
    if (filters.type && filters.type !== 'all' && p.productType !== filters.type) return false
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false
    if (filters.size && !(Array.isArray(p.sizes) && p.sizes.includes(filters.size))) return false
    if (minPrice !== null && !Number.isNaN(minPrice) && p.price < minPrice) return false
    if (maxPrice !== null && !Number.isNaN(maxPrice) && p.price > maxPrice) return false
    if (filters.inStock && p.inStock === false) return false
    if (search) {
      const haystack = `${p.title} ${p.subtitle} ${p.material || ''} ${p.description || ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  if (filters.sort === 'price_asc') {
    return [...filtered].sort((a, b) => a.price - b.price)
  }
  if (filters.sort === 'price_desc') {
    return [...filtered].sort((a, b) => b.price - a.price)
  }
  if (filters.sort === 'newest') {
    return [...filtered].reverse()
  }
  return filtered
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

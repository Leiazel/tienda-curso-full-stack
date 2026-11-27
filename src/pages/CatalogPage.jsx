import { useEffect, useMemo, useState } from 'react'
import { fetchCatalogProducts, filterProductsLocally, formatPrice } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'

const PRODUCT_TYPES = [
  { id: 'all', label: 'TODO EL DROP' },
  { id: 'apparel', label: 'INDUMENTARIA' },
  { id: 'footwear', label: 'CALZADO' },
  { id: 'accessory', label: 'ACCESORIOS' },
]

const CATEGORIES = [
  { id: 'all', label: 'TODAS', type: 'all' },
  { id: 'sneakers', label: 'ZAPATILLAS', type: 'footwear' },
  { id: 'hoodies', label: 'HOODIES', type: 'apparel' },
  { id: 'pants', label: 'PANTALONES', type: 'apparel' },
  { id: 'tees', label: 'REMERAS', type: 'apparel' },
  { id: 'outerwear', label: 'OUTERWEAR', type: 'apparel' },
  { id: 'accessories', label: 'ACCESORIOS', type: 'accessory' },
]

const SIZES_BY_TYPE = {
  apparel: ['S', 'M', 'L', 'XL'],
  footwear: ['US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12'],
  accessory: ['ONE SIZE'],
  all: ['S', 'M', 'L', 'XL', 'US 8', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12', 'ONE SIZE'],
}

const PRICE_PRESETS = [
  { id: 'under-100', label: 'HASTA $100.000', min: '', max: '100000' },
  { id: '100-180', label: '$100.000 – $180.000', min: '100000', max: '180000' },
  { id: 'over-180', label: 'MÁS DE $180.000', min: '180000', max: '' },
]

const SORT_OPTIONS = [
  { id: 'featured', label: 'DESTACADOS' },
  { id: 'price_asc', label: 'MENOR A MAYOR PRECIO' },
  { id: 'price_desc', label: 'MAYOR A MENOR PRECIO' },
  { id: 'newest', label: 'MÁS NUEVOS' },
]

export default function CatalogPage({ products, isOffline = false, onAddToCart, onQuickView }) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSize, setActiveSize] = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('')
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')

  const [catalogItems, setCatalogItems] = useState(products)
  const [totalCount, setTotalCount] = useState(products.length)
  const [loading, setLoading] = useState(true)
  const [usingOfflineFallback, setUsingOfflineFallback] = useState(isOffline)
  const [retrySeed, setRetrySeed] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedMinPrice(minPriceInput.trim())
      setDebouncedMaxPrice(maxPriceInput.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [minPriceInput, maxPriceInput])

  const visibleCategories = useMemo(() => {
    if (activeType === 'all') return CATEGORIES
    return CATEGORIES.filter((cat) => cat.id === 'all' || cat.type === activeType)
  }, [activeType])

  const effectiveSizeType = useMemo(() => {
    if (activeType !== 'all') return activeType
    if (activeCategory === 'sneakers') return 'footwear'
    if (activeCategory === 'accessories') return 'accessory'
    if (activeCategory !== 'all') return 'apparel'
    return 'all'
  }, [activeType, activeCategory])

  const availableSizes = SIZES_BY_TYPE[effectiveSizeType] || SIZES_BY_TYPE.all

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      type: activeType,
      category: activeCategory,
      size: activeSize,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      inStock: inStockOnly,
      sort: sortBy,
    }),
    [debouncedSearch, activeType, activeCategory, activeSize, debouncedMinPrice, debouncedMaxPrice, inStockOnly, sortBy],
  )

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setLoading(true)
    fetchCatalogProducts(filters, { signal: controller.signal })
      .then(({ items, total }) => {
        if (!active) return
        setCatalogItems(items)
        setTotalCount(total)
        setUsingOfflineFallback(false)
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return
        const local = filterProductsLocally(products, filters)
        setCatalogItems(local)
        setTotalCount(local.length)
        setUsingOfflineFallback(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [filters, products, retrySeed])

  function handleTypeChange(nextType) {
    setActiveType(nextType)
    if (nextType !== 'all') {
      const catMeta = CATEGORIES.find((c) => c.id === activeCategory)
      if (catMeta && catMeta.id !== 'all' && catMeta.type !== nextType) {
        setActiveCategory('all')
      }
      const nextSizes = SIZES_BY_TYPE[nextType] || []
      if (activeSize && !nextSizes.includes(activeSize)) {
        setActiveSize('')
      }
    }
  }

  function handleCategoryChange(nextCategory) {
    setActiveCategory(nextCategory)
    if (nextCategory !== 'all' && activeType === 'all') {
      const catMeta = CATEGORIES.find((c) => c.id === nextCategory)
      const nextSizes = SIZES_BY_TYPE[catMeta?.type || 'all'] || SIZES_BY_TYPE.all
      if (activeSize && !nextSizes.includes(activeSize)) {
        setActiveSize('')
      }
    }
  }

  function handlePresetClick(preset) {
    const isSame = minPriceInput === preset.min && maxPriceInput === preset.max
    const nextMin = isSame ? '' : preset.min
    const nextMax = isSame ? '' : preset.max
    setMinPriceInput(nextMin)
    setMaxPriceInput(nextMax)
    setDebouncedMinPrice(nextMin)
    setDebouncedMaxPrice(nextMax)
  }

  function clearAllFilters() {
    setSearchInput('')
    setDebouncedSearch('')
    setActiveType('all')
    setActiveCategory('all')
    setActiveSize('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setDebouncedMinPrice('')
    setDebouncedMaxPrice('')
    setInStockOnly(false)
    setSortBy('featured')
  }

  const activeChips = []
  if (debouncedSearch) {
    activeChips.push({
      key: 'search',
      label: `BÚSQUEDA: "${debouncedSearch}"`,
      onRemove: () => {
        setSearchInput('')
        setDebouncedSearch('')
      },
    })
  }
  if (activeType !== 'all') {
    const typeLabel = PRODUCT_TYPES.find((t) => t.id === activeType)?.label || activeType
    activeChips.push({
      key: 'type',
      label: `TIPO: ${typeLabel}`,
      onRemove: () => handleTypeChange('all'),
    })
  }
  if (activeCategory !== 'all') {
    const catLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory
    activeChips.push({
      key: 'category',
      label: `CATEGORÍA: ${catLabel}`,
      onRemove: () => handleCategoryChange('all'),
    })
  }
  if (activeSize) {
    activeChips.push({
      key: 'size',
      label: `TALLE: ${activeSize}`,
      onRemove: () => setActiveSize(''),
    })
  }
  if (debouncedMinPrice !== '' || debouncedMaxPrice !== '') {
    let priceLabel = ''
    if (debouncedMinPrice !== '' && debouncedMaxPrice !== '') {
      priceLabel = `${formatPrice(debouncedMinPrice)} – ${formatPrice(debouncedMaxPrice)}`
    } else if (debouncedMinPrice !== '') {
      priceLabel = `DESDE ${formatPrice(debouncedMinPrice)}`
    } else {
      priceLabel = `HASTA ${formatPrice(debouncedMaxPrice)}`
    }
    activeChips.push({
      key: 'price',
      label: `PRECIO: ${priceLabel}`,
      onRemove: () => {
        setMinPriceInput('')
        setMaxPriceInput('')
        setDebouncedMinPrice('')
        setDebouncedMaxPrice('')
      },
    })
  }
  if (inStockOnly) {
    activeChips.push({
      key: 'stock',
      label: 'SOLO CON STOCK',
      onRemove: () => setInStockOnly(false),
    })
  }
  if (sortBy !== 'featured') {
    const sortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || sortBy
    activeChips.push({
      key: 'sort',
      label: `ORDEN: ${sortLabel}`,
      onRemove: () => setSortBy('featured'),
    })
  }

  return (
    <main className="catalog-page">
      <header className="catalog-header container">
        <p className="catalog-eyebrow">L&amp;D™ DROP 04 / INDUMENTARIA &amp; CALZADO EN SERIES PEQUEÑAS</p>
        <h1 className="font-wide-left textured-black">LA COLECCIÓN</h1>
        <p className="editorial-caption">
          DISEÑOS DE EDICIÓN LIMITADA. MATERIALES NATURALES. HECHOS PARA MARCAR LA DIFERENCIA.
        </p>

        <div className="catalog-controls">
          <div className="catalog-search-row">
            <div className="catalog-search-box">
              <input
                type="search"
                className="form-control catalog-search-input"
                placeholder="BUSCAR POR NOMBRE, MATERIAL, MODELO..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Buscar productos en el catálogo"
              />
              {searchInput && (
                <button
                  type="button"
                  className="catalog-search-clear"
                  onClick={() => {
                    setSearchInput('')
                    setDebouncedSearch('')
                  }}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            <div className="catalog-sort-wrap">
              <label className="catalog-control-label" htmlFor="catalogSort">
                ORDENAR
              </label>
              <select
                id="catalogSort"
                className="form-select catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="catalog-filter-block">
            <span className="catalog-control-label">TIPO</span>
            <div className="catalog-filters d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de producto">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`catalog-filter-btn${activeType === type.id ? ' active' : ''}`}
                  onClick={() => handleTypeChange(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-block">
            <span className="catalog-control-label">CATEGORÍA</span>
            <div className="catalog-filters d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`catalog-filter-btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-grid">
            <div className="catalog-filter-block">
              <span className="catalog-control-label">TALLE</span>
              <div className="catalog-size-pills" role="group" aria-label="Filtrar por talle">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`catalog-size-btn${activeSize === size ? ' active' : ''}`}
                    onClick={() => setActiveSize((curr) => (curr === size ? '' : size))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="catalog-filter-block">
              <span className="catalog-control-label">PRECIO (ARS)</span>
              <div className="catalog-price-controls">
                <div className="catalog-price-inputs">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-control catalog-price-input"
                    placeholder="MÍN"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    aria-label="Precio mínimo en ARS"
                  />
                  <span className="catalog-price-sep">–</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-control catalog-price-input"
                    placeholder="MÁX"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    aria-label="Precio máximo en ARS"
                  />
                </div>
                <div className="catalog-price-presets">
                  {PRICE_PRESETS.map((preset) => {
                    const isActive = minPriceInput === preset.min && maxPriceInput === preset.max
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`catalog-preset-btn${isActive ? ' active' : ''}`}
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="catalog-bottom-bar">
            <label className="catalog-stock-switch">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span className="catalog-switch-track" aria-hidden="true" />
              <span>SOLO CON STOCK DISPONIBLE</span>
            </label>

            {activeChips.length > 0 && (
              <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
                LIMPIAR FILTROS ({activeChips.length})
              </button>
            )}
          </div>

          {activeChips.length > 0 && (
            <div className="active-filters-bar" aria-label="Filtros activos">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="filter-chip"
                  onClick={chip.onRemove}
                  aria-label={`Quitar filtro ${chip.label}`}
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <section id="featured" className="catalog-products container">
        <div className="catalog-section-heading">
          <h2 className="font-wide-left textured-black">LANZAMIENTO DESTACADO</h2>
          <span>
            {loading
              ? 'CARGANDO...'
              : `${totalCount} ${totalCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'}`}
          </span>
        </div>

        {usingOfflineFallback && !loading && (
          <div className="catalog-offline-notice" role="status">
            <span>MODO OFFLINE · MOSTRANDO CATÁLOGO LOCAL DE RESPALDO</span>
            <button type="button" onClick={() => setRetrySeed((n) => n + 1)}>
              REINTENTAR CONEXIÓN
            </button>
          </div>
        )}

        {loading ? (
          <div className="row g-4 catalog-grid" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="col-12 col-md-6 col-xl-4" key={`skeleton-${index}`}>
                <div className="product-card product-card-skeleton" aria-hidden="true">
                  <div className="skeleton-box skeleton-badge" />
                  <div className="skeleton-box skeleton-media" />
                  <div className="skeleton-meta">
                    <div className="skeleton-meta-left">
                      <div className="skeleton-box skeleton-title" />
                      <div className="skeleton-box skeleton-sub" />
                    </div>
                    <div className="skeleton-box skeleton-price" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : catalogItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="font-wide-left mb-1">SIN PRODUCTOS CON ESTOS FILTROS</p>
            <p className="editorial-caption mx-auto mt-2">
              PROBÁ AJUSTANDO LA BÚSQUEDA, EL RANGO DE PRECIO O LIMPIÁ LOS FILTROS.
            </p>
            {activeChips.length > 0 && (
              <button type="button" className="catalog-filter-btn active mt-3" onClick={clearAllFilters}>
                LIMPIAR FILTROS
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4 catalog-grid">
            {catalogItems.map((product) => (
              <div className="col-12 col-md-6 col-xl-4" key={product.slug || product.id}>
                <ProductCard
                  product={product}
                  extra={product.extra}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

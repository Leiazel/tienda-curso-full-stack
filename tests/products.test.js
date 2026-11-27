import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createMockDb } from './helpers/mockDb.js';
import { filterProductsLocally, normalizeProduct } from '../src/api/client.js';

describe('Categories and Products API (urban apparel & footwear)', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp({ db: createMockDb() });
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('GET /api/categories lists apparel, footwear, and accessory categories', async () => {
    const res = await fetch(`${baseUrl}/api/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total, 6);
    assert.ok(body.items.some((c) => c.slug === 'hoodies' && c.productType === 'apparel'));
    assert.ok(body.items.some((c) => c.slug === 'sneakers' && c.productType === 'footwear'));
  });

  it('GET /api/categories?type=footwear filters footwear categories only', async () => {
    const res = await fetch(`${baseUrl}/api/categories?type=footwear`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].slug, 'sneakers');
  });

  it('GET /api/products?type=footwear returns only footwear with US sizing', async () => {
    const res = await fetch(`${baseUrl}/api/products?type=footwear`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.items.length, 2);
    assert.ok(body.items.every((p) => p.productType === 'footwear'));
    assert.ok(body.items.some((p) => p.sizes.includes('US 9.5')));
  });

  it('GET /api/products?type=apparel&maxPrice=150 filters urban clothing by type and price', async () => {
    const res = await fetch(`${baseUrl}/api/products?type=apparel&maxPrice=150&sort=price_asc`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.items.length, 2);
    assert.equal(body.items[0].slug, 'ld-hoodie-01');
    assert.equal(body.items[1].slug, 'ld-cargo-02');
  });

  it('GET /api/products/:slug returns full product detail with variants, sizes, title and extra', async () => {
    const res = await fetch(`${baseUrl}/api/products/ld-sneaker-05`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'L&D LOW-TOP SNEAKER "CONCRETE"');
    assert.equal(body.title, 'L&D LOW-TOP SNEAKER "CONCRETE"');
    assert.equal(body.extra, false);
    assert.equal(body.category, 'sneakers');
    assert.equal(body.defaultSize, 'US 9.5');
    assert.ok(body.variants.length >= 3);
    assert.equal(body.totalStock, 9);
  });

  it('POST /api/products with relative /images/... path resolves full URL on response', async () => {
    const createRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'L&D MOSTRO LOCAL IMG',
        category: 'sneakers',
        productType: 'footwear',
        price: 245,
        imageUrl: '/images/products/shoe-mostro.jpg',
        defaultSize: 'US 9.5',
      }),
    });

    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.image, `${baseUrl}/images/products/shoe-mostro.jpg`);
    assert.equal(created.imageUrl, `${baseUrl}/images/products/shoe-mostro.jpg`);
    assert.deepEqual(created.galleryUrls, [`${baseUrl}/images/products/shoe-mostro.jpg`]);
    assert.equal(created.title, 'L&D MOSTRO LOCAL IMG');
    assert.equal(created.extra, true);
  });

  it('POST /api/products creates new footwear product with variants and updates stock', async () => {
    const createRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'L&D SKATE SLIP-ON PRO',
        category: 'sneakers',
        productType: 'footwear',
        subtitle: 'Vulcanized Gum Sole · Heavy Canvas',
        price: 125,
        imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
        defaultSize: 'US 9',
        isFeatured: true,
        variants: [
          { size: 'US 9', color: 'Black Gum', colorHex: '#181818', stock: 5 },
          { size: 'US 10', color: 'Black Gum', colorHex: '#181818', stock: 7 },
        ],
      }),
    });

    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.slug, 'l-d-skate-slip-on-pro');
    assert.equal(created.totalStock, 12);
    assert.deepEqual(created.sizes, ['US 9', 'US 10']);

    const variantId = created.variants[0].id;
    const stockRes = await fetch(
      `${baseUrl}/api/products/${created.id}/variants/${variantId}/stock`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: 3 }),
      }
    );
    assert.equal(stockRes.status, 200);
    const stockBody = await stockRes.json();
    assert.equal(stockBody.previousStock, 5);
    assert.equal(stockBody.stock, 8);

    const delRes = await fetch(`${baseUrl}/api/products/${created.id}`, {
      method: 'DELETE',
    });
    assert.equal(delRes.status, 200);
  });

  it('POST /api/products validates required fields and returns 400 with details', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', price: -5 }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.details));
    assert.ok(body.details.length >= 3);
  });

  it('DELETE /api/categories/:id prevents deleting category in use (409)', async () => {
    const res = await fetch(`${baseUrl}/api/categories/1`, { method: 'DELETE' });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.error, 'CATEGORY_IN_USE');
  });

  it('GET /api/products?search=zapatillas finds all sneakers via category even when product text omits the word', async () => {
    const createRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'L&D NEON PULSE TECH',
        category: 'sneakers',
        productType: 'footwear',
        subtitle: 'Obsidian Mesh · Neon Pink / Neon Blue',
        description: 'Tech-runner futurista con malla negra respirable.',
        price: 195000,
        imageUrl: '/images/products/ld-neon-pulse-pink.jpg',
        defaultSize: 'US 10',
        variants: [{ size: 'US 10', color: 'Neon Pink', colorHex: '#FF2E93', stock: 5 }],
      }),
    });
    assert.equal(createRes.status, 201);
    const createdNeon = await createRes.json();

    try {
      // Plural "zapatillas" finds all sneakers (including Neon Pulse Tech and Runner 02)
      const pluralRes = await fetch(`${baseUrl}/api/products?search=zapatillas`);
      assert.equal(pluralRes.status, 200);
      const pluralBody = await pluralRes.json();
      const pluralSlugs = pluralBody.items.map((p) => p.slug);
      assert.ok(pluralSlugs.includes('ld-sneaker-05'));
      assert.ok(pluralSlugs.includes('ld-runner-07'));
      assert.ok(pluralSlugs.includes(createdNeon.slug));

      // Singular "zapatilla" also finds all sneakers
      const singularRes = await fetch(`${baseUrl}/api/products?search=zapatilla`);
      assert.equal(singularRes.status, 200);
      const singularBody = await singularRes.json();
      assert.ok(singularBody.items.some((p) => p.slug === createdNeon.slug));

      // Multi-word + accented search "zapatillas neón" matches Neon Pulse Tech
      const multiRes = await fetch(
        `${baseUrl}/api/products?search=${encodeURIComponent('zapatillas neón')}`
      );
      assert.equal(multiRes.status, 200);
      const multiBody = await multiRes.json();
      assert.equal(multiBody.items.length, 1);
      assert.equal(multiBody.items[0].slug, createdNeon.slug);
    } finally {
      await fetch(`${baseUrl}/api/products/${createdNeon.id}?hard=true`, { method: 'DELETE' });
    }
  });

  it('filterProductsLocally matches plurals, accents, categories, and multi-word queries offline', () => {
    const sample = [
      normalizeProduct({
        id: 'ld-sneaker-12',
        slug: 'ld-sneaker-12',
        title: 'L&D NEON PULSE TECH',
        subtitle: 'Obsidian Mesh & Jaula Plateada',
        description: 'Tech-runner futurista con malla negra respirable.',
        category: 'sneakers',
        price: 195000,
        variants: [{ size: 'US 10', color: 'Neon Pink', stock: 5, isActive: true }],
      }),
      normalizeProduct({
        id: 'ld-hoodie-01',
        slug: 'ld-hoodie-01',
        title: 'L&D BOXY HEAVYWEIGHT HOODIE',
        subtitle: '480GSM French Terry',
        description: 'Buzo boxy cropped.',
        category: 'hoodies',
        price: 118000,
      }),
      normalizeProduct({
        id: 'ld-cargo-02',
        slug: 'ld-cargo-02',
        title: 'PARACHUTE CARGO PANTS V2 "UNDERPASS"',
        subtitle: 'Technical Olive Ripstop · 8 Utility Pockets',
        description: 'Pantalón cargo diseñado para caer sobre zapatillas chunky.',
        category: 'pants',
        price: 142000,
      }),
    ];

    const sneakerResults = filterProductsLocally(sample, { search: 'zapatillas' });
    assert.equal(sneakerResults.length, 1);
    assert.equal(sneakerResults[0].slug, 'ld-sneaker-12');
    assert.equal(filterProductsLocally(sample, { search: 'zapatilla' }).length, 1);
    assert.equal(filterProductsLocally(sample, { search: 'zapatillas neón' }).length, 1);
    assert.equal(filterProductsLocally(sample, { search: 'zapatillas neon' }).length, 1);
    assert.equal(filterProductsLocally(sample, { search: 'buzos' }).length, 1);
  });
});

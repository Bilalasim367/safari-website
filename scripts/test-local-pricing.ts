/**
 * End-to-end pricing verification for /api/cart and /api/orders.
 *
 * REFUSES TO RUN against anything that is not a local MySQL instance, and
 * refuses to run at all unless TEST_LOCAL_PRICING=1 is set. Every row it
 * creates is removed in `cleanup()`.
 *
 * Run: TEST_LOCAL_PRICING=1 npx tsx scripts/test-local-pricing.ts
 */
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';
import { priceCartLine, type PriceableProduct } from '../src/lib/order-pricing';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

function assertLocalDb(): void {
  if (process.env.TEST_LOCAL_PRICING !== '1') {
    throw new Error('Refusing to run: set TEST_LOCAL_PRICING=1 to confirm this is intended.');
  }
  const url = process.env.DATABASE_URL || '';
  let host = '';
  try {
    host = new URL(url.replace(/^mysql:\/\//, 'http://')).hostname;
  } catch {
    throw new Error('Refusing to run: DATABASE_URL is not parseable.');
  }
  const localHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
  if (!localHosts.includes(host)) {
    throw new Error(`Refusing to run: DATABASE_URL host "${host}" is not local.`);
  }
  console.log(`[guard] local DB confirmed (host=${host})`);
}

const TEST_EMAIL = 'pricing-test@local.invalid';
let cookie = '';
const createdOrderIds: string[] = [];
const createdProductIds: string[] = [];

async function login(): Promise<void> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: 'Test-Only-123!' }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/access_token=[^;]+/);
  if (!match) throw new Error('login returned no access_token cookie');
  cookie = match[0];
  console.log('[setup] logged in via the real /api/auth/login route');
}

type Line = { id: string; name: string; price: number; image: string; size: string; quantity: number };

async function postCart(lines: Line[]) {
  return fetch(`${BASE}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ cart: lines }),
  });
}

async function postOrder(lines: Line[]) {
  return fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      items: lines,
      shippingAddress: {
        firstName: 'Pricing', lastName: 'Test',
        email: TEST_EMAIL, phone: '03000000000',
        address: '1 Test St', city: 'Karachi', province: 'Sindh', postalCode: '75500', country: 'Pakistan',
      },
      paymentMethod: 'cod',
    }),
  });
}

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${detail}`); }
}

async function main() {
  assertLocalDb();

  // Two fixtures: one Attar (default 12ml), one Perfume (default 50ml).
  const attar = await prisma.product.findFirst({
    where: { isActive: true, inStock: true, type: 'Attar', price6mlOnline: { gt: 0 }, price12mlOnline: { gt: 0 } },
  });
  const perfume = await prisma.product.findFirst({
    where: { isActive: true, inStock: true, type: 'Perfume', price50mlOnline: { gt: 0 } },
  });
  if (!attar) throw new Error('No active in-stock Attar fixture found.');

  console.log(`\n[fixture] Attar   ${attar.name} (${attar.sizesAvailable})`);
  console.log(`[fixture] Perfume ${perfume ? perfume.name : 'none'}`);
  console.log(`[fixture] attar pricing: base=${attar.price} 3ml=${attar.price3mlOnline} 6ml=${attar.price6mlOnline} 12ml=${attar.price12mlOnline} 50ml=${attar.price50mlOnline}`);
  if (perfume) console.log(`[fixture] perfume pricing: base=${perfume.price} 50ml=${perfume.price50mlOnline} sizes=${perfume.sizesAvailable}`);

  // Clean slate for the throwaway user.
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.user.create({
    data: {
      email: TEST_EMAIL,
      password: await bcrypt.hash('Test-Only-123!', 10),
      name: 'Pricing Test',
      role: 'customer',
    },
  });
  console.log('[setup] throwaway user created');
  await login();

  // ---- 1. cart POST + order POST agree, across sizes -------------------
  console.log('\n[1] cart/order agreement per size');
  const scenarios = [
    { label: '6ml', product: attar, size: '6ml' },
    { label: '12ml', product: attar, size: '12ml' },
    ...(perfume ? [{ label: 'default(50ml perfume)', product: perfume, size: '' }] : []),
  ];

  for (const s of scenarios) {
    const expected = priceCartLine(s.product as PriceableProduct, s.size || undefined);
    if (!expected.ok) { check(`${s.label} resolvable`, false, JSON.stringify(expected)); continue; }
    const unit = expected.price;

    const line = {
      id: s.product.id, name: 'client-supplied-name', price: 1,
      image: '', size: s.size || '', quantity: 2,
    };

    await postCart([line]);
    const uid = (await prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL } })).id;
    const stored = await prisma.cartItem.findMany({ where: { userId: uid } });
    const cartTotal = stored.reduce((sum, r) => sum + r.price * r.quantity, 0);

    const orderRes = await postOrder([line]);
    const orderJson = await orderRes.json();
    if (orderRes.ok && orderJson.order?.id) createdOrderIds.push(orderJson.order.id);
    // The POST /orders response intentionally omits line items, so assert
    // against the rows actually persisted rather than the response body.
    const persistedItems = orderJson.order?.id
      ? await prisma.orderItem.findMany({ where: { orderId: orderJson.order.id } })
      : [];
    const orderLine = persistedItems[0];

    check(`${s.label}: cart stored unit price = DB price`, stored[0]?.price === unit, `got ${stored[0]?.price} want ${unit}`);
    check(`${s.label}: order stored unit price = DB price`, orderLine?.price === unit, `got ${orderLine?.price} want ${unit}`);
    check(`${s.label}: order stored the charged size`, orderLine?.size === expected.size, `got ${orderLine?.size} want ${expected.size}`);
    check(`${s.label}: cart total === order subtotal`, cartTotal === orderJson.order?.subtotal, `cart ${cartTotal} vs order ${orderJson.order?.subtotal}`);
  }

  // ---- 2. tampered client price ---------------------------------------
  console.log('\n[2] tampered client price is ignored');
  {
    const expected = priceCartLine(attar as PriceableProduct, '6ml');
    if (!expected.ok) throw new Error('6ml fixture not resolvable');
    const line = { id: attar.id, name: 'HACK', price: 0.01, image: '', size: '6ml', quantity: 1 };
    const res = await postOrder([line]);
    const json = await res.json();
    if (json.order?.id) createdOrderIds.push(json.order.id);
    const tamperedItems = json.order?.id ? await prisma.orderItem.findMany({ where: { orderId: json.order.id } }) : [];
    check('charged the DB price, not 0.01', tamperedItems[0]?.price === expected.price, `got ${tamperedItems[0]?.price} want ${expected.price}`);
    check('subtotal not tampered', json.order?.subtotal === expected.price, `got ${json.order?.subtotal}`);
  }

  // ---- 3. invalid size rejected ---------------------------------------
  console.log('\n[3] invalid size rejected');
  {
    const res = await postOrder([{ id: attar.id, name: 'X', price: 100, image: '', size: '999ml', quantity: 1 }]);
    const json = await res.json();
    check('rejected with 400', res.status === 400, `got ${res.status}`);
    check('code is unknown_size', json.code === 'unknown_size', `got ${json.code}`);
    check('no order created', !json.order);
  }

  // ---- 4. out of stock --------------------------------------------------
  // Stock is product-level in this schema, so "an out-of-stock size" means a
  // line that cannot be filled: we create a real out-of-stock fixture rather
  // than mutating a live product row.
  console.log('\n[4] out-of-stock');
  {
    const oosProduct = await prisma.product.create({
      data: {
        name: '__PRICING_TEST_OOS__',
        slug: '__pricing-test-oos__',
        price: 999,
image: '',
        images: '[]',
        notesTop: '', notesHeart: '', notesBase: '',
        size: '12ml',
        type: 'Attar',
        isActive: true,
        inStock: false,
        sizesAvailable: '12ml',
        sizePrices: '[]',
        price12mlOnline: 999,
      },
    });
    createdProductIds.push(oosProduct.id);

    const res = await postOrder([{ id: oosProduct.id, name: 'X', price: 100, image: '', size: '12ml', quantity: 1 }]);
    const json = await res.json();
    check('order rejects an out-of-stock line with 400', res.status === 400, `got ${res.status}`);
    check('code is unavailable', json.code === 'unavailable', `got ${json.code}`);

    const cartRes = await postCart([{ id: oosProduct.id, name: 'X', price: 100, image: '', size: '12ml', quantity: 1 }]);
    const uid = (await prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL } })).id;
    const remaining = await prisma.cartItem.count({ where: { userId: uid } });
    check('cart POST does not persist an unpriceable line', cartRes.ok && remaining === 0, `remaining ${remaining}`);
  }

  // ---- 4b. a real size the product does not offer ----------------------
  // Distinct from the nonsense "999ml" case: 6ml is a genuine column, but
  // this product only sells 12ml, so it must still be refused rather than
  // silently priced at the 12ml figure.
  console.log('\n[4b] real size not offered by the product');
  {
    const restricted = await prisma.product.create({
      data: {
        name: '__PRICING_TEST_RESTRICTED__',
        slug: '__pricing-test-restricted__',
        price: 777,
        image: '',
        images: '[]',
        notesTop: '', notesHeart: '', notesBase: '',
        size: '12ml', type: 'Attar', isActive: true, inStock: true,
        sizesAvailable: '12ml', sizePrices: '[]',
        price6mlOnline: 400, price12mlOnline: 777,
      },
    });
    createdProductIds.push(restricted.id);

    const res = await postOrder([{ id: restricted.id, name: 'X', price: 100, image: '', size: '6ml', quantity: 1 }]);
    const json = await res.json();
    check('6ml refused for a 12ml-only product', res.status === 400 && json.code === 'unknown_size', `got ${res.status} ${json.code}`);

    const okRes = await postOrder([{ id: restricted.id, name: 'X', price: 100, image: '', size: '12ml', quantity: 1 }]);
    const okJson = await okRes.json();
    if (okJson.order?.id) createdOrderIds.push(okJson.order.id);
    const okItems = okJson.order?.id ? await prisma.orderItem.findMany({ where: { orderId: okJson.order.id } }) : [];
    check('12ml accepted at its own price (not 6ml, not base)', okItems[0]?.price === 777, `got ${okItems[0]?.price}`);
  }

  // ---- 5. deactivated product -----------------------------------------
  console.log('\n[5] deactivated product');
  {
    const inactive = await prisma.product.findFirst({ where: { isActive: false } });
    if (inactive) {
      const res = await postOrder([{ id: inactive.id, name: 'X', price: 100, image: '', size: '', quantity: 1 }]);
      check('rejected with 400', res.status === 400, `got ${res.status}`);
    } else {
      console.log('  SKIP  no deactivated product in local DB');
    }
  }

  // ---- 6. cart POST drops unknown ids --------------------------------
  console.log('\n[6] cart POST rejects unknown ids');
  {
    const res = await postCart([{ id: '1', name: 'Phantom', price: 1799, image: '', size: '12ml', quantity: 1 }]);
    const json = await res.json();
    const uid = (await prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL } })).id;
    const remaining = await prisma.cartItem.count({ where: { userId: uid } });
    check('phantom id reported back', Array.isArray(json.removedIds) && json.removedIds.includes('1'), JSON.stringify(json.removedIds));
    check('no orphan row persisted', remaining === 0, `remaining ${remaining}`);
  }

  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
}

async function cleanup() {
  const uid = await prisma.user.findUnique({ where: { email: TEST_EMAIL }, select: { id: true } });
  if (uid) {
    await prisma.cartItem.deleteMany({ where: { userId: uid.id } });
  }
  if (createdOrderIds.length) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
  }
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.notification.deleteMany({ where: { title: { startsWith: 'New Order' }, message: { contains: 'Pricing Test' } } });
  console.log(`[cleanup] removed test user, ${createdOrderIds.length} test orders, test cart rows, ${createdProductIds.length} product fixtures`);
}

main()
  .catch((e) => { console.error('\n[error]', e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(async () => {
    try { await cleanup(); } catch (e) { console.error('[cleanup error]', e instanceof Error ? e.message : e); }
    await prisma.$disconnect();
  });

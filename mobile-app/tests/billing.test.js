const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const billingSource = fs.readFileSync(path.join(__dirname, '..', 'www', 'billing.js'), 'utf8');

function makeLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function loadBilling({ purchase, initialStorage } = {}) {
  const window = {};
  const context = {
    window,
    localStorage: makeLocalStorage(initialStorage),
    console,
  };
  if (purchase) context.CdvPurchase = purchase;
  vm.runInNewContext(billingSource, context, { filename: 'billing.js' });
  return window.AscendBilling;
}

async function main() {
  const browserBilling = loadBilling({
    initialStorage: { ascend_keys_basic_cached: 'true' },
  });
  let browserStatus;
  browserBilling.onStatusChange(status => { browserStatus = status; });
  assert.doesNotThrow(() => browserBilling.init());
  assert.deepEqual({ ...browserStatus }, { basic: true, premium: false });
  assert.equal(browserBilling.isAvailable(), false);

  const handlers = {};
  const registered = [];
  const ownership = {
    ascend_keys_basic_monthly: false,
    ascend_keys_premium_monthly: false,
  };
  let initializedPlatform;
  let orderedOffer;
  let restoreCalls = 0;

  const when = {};
  for (const event of ['approved', 'verified', 'receiptUpdated', 'productUpdated', 'receiptsReady']) {
    when[event] = callback => {
      handlers[event] = callback;
      return when;
    };
  }

  const products = {
    ascend_keys_basic_monthly: {
      id: 'ascend_keys_basic_monthly',
      getOffer: () => ({ id: 'basic-offer', pricingPhases: [{ price: '$4.99' }] }),
    },
    ascend_keys_premium_monthly: {
      id: 'ascend_keys_premium_monthly',
      getOffer: () => ({ id: 'premium-offer', pricingPhases: [{ price: '$5.99' }] }),
    },
  };

  const store = {
    register: product => registered.push(product),
    when: () => when,
    error: callback => { handlers.error = callback; },
    ready: callback => { handlers.ready = callback; },
    initialize: platforms => {
      initializedPlatform = platforms;
      handlers.productUpdated(products.ascend_keys_basic_monthly);
      handlers.productUpdated(products.ascend_keys_premium_monthly);
      handlers.receiptsReady();
      handlers.ready();
    },
    get: id => products[id],
    owned: id => ownership[id],
    order: async offer => { orderedOffer = offer; },
    restorePurchases: async () => { restoreCalls += 1; },
  };

  const nativeBilling = loadBilling({
    purchase: {
      store,
      ProductType: { PAID_SUBSCRIPTION: 'paid-subscription' },
      Platform: { GOOGLE_PLAY: 'google-play' },
    },
  });
  const statuses = [];
  nativeBilling.onStatusChange(status => statuses.push({ ...status }));
  assert.doesNotThrow(() => nativeBilling.init());
  assert.deepEqual(registered.map(product => product.id), [
    'ascend_keys_basic_monthly',
    'ascend_keys_premium_monthly',
  ]);
  assert.deepEqual(Array.from(initializedPlatform), ['google-play']);
  assert.equal(nativeBilling.isReady(), true);
  assert.equal(nativeBilling.getPriceString('basic'), '$4.99/month');
  assert.equal(nativeBilling.getPriceString('premium'), '$5.99/month');

  ownership.ascend_keys_basic_monthly = true;
  handlers.receiptUpdated({});
  assert.deepEqual(statuses.at(-1), { basic: true, premium: false });

  ownership.ascend_keys_premium_monthly = true;
  let verifyCalls = 0;
  handlers.approved({ verify: () => { verifyCalls += 1; } });
  assert.equal(verifyCalls, 1);
  let finishCalls = 0;
  handlers.verified({ finish: () => { finishCalls += 1; } });
  assert.equal(finishCalls, 1);
  assert.deepEqual(statuses.at(-1), { basic: true, premium: true });

  await nativeBilling.subscribe('premium');
  assert.equal(orderedOffer.id, 'premium-offer');
  await nativeBilling.restore();
  assert.equal(restoreCalls, 1);
}

main().then(() => {
  console.log('Google Play Billing wrapper tests passed.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});

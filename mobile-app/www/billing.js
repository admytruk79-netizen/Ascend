/**
 * ASCEND Keys — Google Play Billing wrapper
 * Wraps cordova-plugin-purchase (CdvPurchase) so app.js never talks to the
 * billing plugin directly. Falls back to "unavailable" when the plugin
 * isn't present (e.g. previewing index.html in a desktop browser).
 *
 * Two independent subscription tiers, each its own Play Console product:
 * Basic covers the standard spreads, Premium covers everything (including
 * the special spreads) and always subsumes Basic.
 */
(function (global) {
  const PRODUCTS = {
    basic: { id: 'ascend_keys_basic_monthly', cacheKey: 'ascend_keys_basic_cached', defaultPrice: '$4.99/month' },
    premium: { id: 'ascend_keys_premium_monthly', cacheKey: 'ascend_keys_sub_cached', defaultPrice: '$5.99/month' },
  };

  let statusListeners = [];
  let ready = false;
  let available = typeof CdvPurchase !== 'undefined';
  let owned = { basic: false, premium: false };
  let priceStrings = { basic: PRODUCTS.basic.defaultPrice, premium: PRODUCTS.premium.defaultPrice };

  function loadCached(tier) {
    try { return localStorage.getItem(PRODUCTS[tier].cacheKey) === 'true'; } catch (e) { return false; }
  }

  function saveCached(tier, val) {
    try { localStorage.setItem(PRODUCTS[tier].cacheKey, val ? 'true' : 'false'); } catch (e) {}
  }

  function notify() {
    const status = { basic: owned.basic, premium: owned.premium };
    statusListeners.forEach(fn => fn(status));
  }

  function setOwned(tier, val) {
    if (owned[tier] === val) return;
    owned[tier] = val;
    saveCached(tier, val);
    notify();
  }

  function syncOwnership(store) {
    Object.keys(PRODUCTS).forEach(tier => {
      setOwned(tier, store.owned(PRODUCTS[tier].id));
    });
  }

  function updateProduct(product) {
    const tier = Object.keys(PRODUCTS).find(key => PRODUCTS[key].id === product.id);
    if (!tier) return;
    const offer = product.getOffer ? product.getOffer() : (product.offers && product.offers[0]);
    if (offer && offer.pricingPhases && offer.pricingPhases[0]) {
      priceStrings[tier] = offer.pricingPhases[0].price + '/month';
    }
  }

  function init() {
    owned.basic = loadCached('basic');
    owned.premium = loadCached('premium');

    if (!available) {
      // No native billing plugin present (browser preview / not yet built).
      notify();
      return;
    }

    const { store, ProductType, Platform } = CdvPurchase;

    Object.keys(PRODUCTS).forEach(tier => {
      const id = PRODUCTS[tier].id;
      store.register({ id, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY });
    });

    // cordova-plugin-purchase v13 exposes ownership through store.owned().
    // There is no `store.when(id).owned(...)` event; attempting to register
    // one throws before store.initialize() and disables billing entirely.
    store.when()
      .approved(transaction => transaction.verify())
      .verified(receipt => {
        syncOwnership(store);
        receipt.finish();
      })
      .receiptUpdated(() => syncOwnership(store))
      .productUpdated(product => {
        updateProduct(product);
        syncOwnership(store);
      })
      .receiptsReady(() => syncOwnership(store));

    store.error(err => {
      console.error('[AscendBilling] store error', err);
    });

    store.ready(() => {
      ready = true;
      Object.keys(PRODUCTS).forEach(tier => {
        const product = store.get(PRODUCTS[tier].id);
        if (product) updateProduct(product);
      });
      syncOwnership(store);
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }

  function subscribe(tier) {
    if (!PRODUCTS[tier]) {
      return Promise.reject(new Error('Unknown membership tier.'));
    }
    if (!available) {
      return Promise.reject(new Error('Billing unavailable in this preview. Install the Android app to subscribe.'));
    }
    const { store } = CdvPurchase;
    const product = store.get(PRODUCTS[tier].id);
    if (!product) {
      return Promise.reject(new Error('Subscription product not loaded yet — try again in a moment.'));
    }
    const offer = product.getOffer ? product.getOffer() : (product.offers && product.offers[0]);
    if (!offer) {
      return Promise.reject(new Error('No purchasable offer found for this product.'));
    }
    return store.order(offer);
  }

  function restore() {
    if (!available) {
      return Promise.reject(new Error('Billing unavailable in this preview. Install the Android app to restore.'));
    }
    return CdvPurchase.store.restorePurchases();
  }

  function onStatusChange(fn) {
    statusListeners.push(fn);
  }

  global.AscendBilling = {
    init,
    subscribe,
    restore,
    onStatusChange,
    isAvailable: () => available,
    isReady: () => ready,
    getPriceString: (tier) => priceStrings[tier] || (PRODUCTS[tier] && PRODUCTS[tier].defaultPrice) || '',
    isSubscribedCached: (tier) => loadCached(tier),
  };
})(window);

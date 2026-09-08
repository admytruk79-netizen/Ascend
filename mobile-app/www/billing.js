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
  const MEMBERSHIP_GROUP = 'ascend_keys_membership';

  let statusListeners = [];
  let ready = false;
  let available = typeof CdvPurchase !== 'undefined';
  let owned = { basic: false, premium: false };
  let priceStrings = { basic: PRODUCTS.basic.defaultPrice, premium: PRODUCTS.premium.defaultPrice };
  let trialStrings = { basic: '', premium: '' };

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

  function isFreeTrialPhase(phase) {
    const freeTrialMode = typeof CdvPurchase !== 'undefined' && CdvPurchase.PaymentMode
      ? CdvPurchase.PaymentMode.FREE_TRIAL
      : 'FreeTrial';
    return phase && phase.paymentMode === freeTrialMode;
  }

  function selectOffer(product, allowTrial = true) {
    const offers = product && product.offers ? product.offers : [];
    // Google Play only returns offers the current account is eligible for.
    // Prefer an eligible free-trial offer; returning subscribers normally see
    // only the base-plan offer and therefore cannot accidentally receive a
    // second trial.
    const trialOffer = offers.find(offer => (offer.pricingPhases || []).some(isFreeTrialPhase));
    const basePlanOffer = offers.find(offer => !(offer.pricingPhases || []).some(isFreeTrialPhase));
    return (allowTrial ? trialOffer : basePlanOffer)
      || (product && product.getOffer ? product.getOffer() : offers[0]);
  }

  function formatTrialPeriod(period) {
    const match = /^P(\d+)([DWM])$/.exec(period || '');
    if (!match) return 'Free trial';
    const amount = Number(match[1]);
    const units = { D: 'day', W: 'week', M: 'month' };
    return `${amount} ${units[match[2]]}${amount === 1 ? '' : 's'} free`;
  }

  function updateProduct(product) {
    const tier = Object.keys(PRODUCTS).find(key => PRODUCTS[key].id === product.id);
    if (!tier) return;
    const isPremiumUpgrade = tier === 'premium' && owned.basic && !owned.premium;
    const offer = selectOffer(product, !isPremiumUpgrade);
    const phases = offer && offer.pricingPhases ? offer.pricingPhases : [];
    const trialPhase = phases.find(isFreeTrialPhase);
    // A trial is the first $0 phase. The customer-facing recurring price is
    // the final paid phase, not the trial phase.
    const recurringPhase = [...phases].reverse().find(phase => !isFreeTrialPhase(phase) && phase.price);
    if (recurringPhase) priceStrings[tier] = recurringPhase.price + '/month';
    trialStrings[tier] = trialPhase ? formatTrialPeriod(trialPhase.billingPeriod) : '';
  }

  function rejectStoreError(result, fallbackMessage) {
    if (!result) return;
    const error = new Error(result.message || fallbackMessage);
    error.code = result.code;
    error.productId = result.productId;
    throw error;
  }

  function init() {
    owned.basic = loadCached('basic');
    owned.premium = loadCached('premium');
    // Publish cached ownership immediately. A returning subscriber's Play
    // receipt can match the cache, in which case setOwned() intentionally
    // emits nothing when the store finishes loading.
    notify();

    if (!available) {
      // No native billing plugin present (browser preview / not yet built).
      return;
    }

    const { store, ProductType, Platform } = CdvPurchase;

    Object.keys(PRODUCTS).forEach(tier => {
      const id = PRODUCTS[tier].id;
      store.register({
        id,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
        // cordova-plugin-purchase uses a shared group to locate the currently
        // owned purchase token when replacing one Android subscription.
        group: MEMBERSHIP_GROUP,
      });
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
    const isPremiumUpgrade = tier === 'premium' && owned.basic && !owned.premium;
    if (isPremiumUpgrade && !ready) {
      return Promise.reject(new Error('Billing is still confirming your Basic membership — try again in a moment.'));
    }
    const offer = selectOffer(product, !isPremiumUpgrade);
    if (!offer) {
      return Promise.reject(new Error('No purchasable offer found for this product.'));
    }
    const additionalData = isPremiumUpgrade ? {
      googlePlay: {
        // The shared registration group lets the plugin add the Basic
        // purchase token. This mode upgrades immediately and charges only the
        // prorated difference instead of creating a second subscription.
        replacementMode: CdvPurchase.GooglePlay.ReplacementMode.CHARGE_PRORATED_PRICE,
      },
    } : undefined;
    return Promise.resolve()
      .then(() => store.order(offer, additionalData))
      .then(result => rejectStoreError(result, 'Purchase could not be completed.'));
  }

  function restore() {
    if (!available) {
      return Promise.reject(new Error('Billing unavailable in this preview. Install the Android app to restore.'));
    }
    return Promise.resolve()
      .then(() => CdvPurchase.store.restorePurchases())
      .then(result => rejectStoreError(result, 'Purchases could not be restored.'));
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
    getTrialString: (tier) => trialStrings[tier] || '',
    isSubscribedCached: (tier) => loadCached(tier),
  };
})(window);

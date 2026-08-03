/**
 * Invisible Strike — Google Play Billing wrapper
 * Wraps cordova-plugin-purchase (CdvPurchase) so app.js never talks to the
 * billing plugin directly. Falls back to "unavailable" when the plugin
 * isn't present (e.g. previewing index.html in a desktop browser).
 *
 * Unlike ASCEND Keys' monthly subscription, the paid tier here is a single
 * one-time unlock (Grounding, Daily Field Check, Evening Clearing, the five
 * Amortization decks, Astral Aikido, the full cheat sheet) — so this is
 * registered as a NON_CONSUMABLE product rather than PAID_SUBSCRIPTION.
 */
(function (global) {
  const PRODUCT_ID = 'invisible_strike_full_access';
  const CACHE_KEY = 'invisible_strike_unlocked_cached';

  let statusListeners = [];
  let ready = false;
  let available = typeof CdvPurchase !== 'undefined';
  let priceString = '$4.99';

  function notify(unlocked) {
    try {
      localStorage.setItem(CACHE_KEY, unlocked ? 'true' : 'false');
    } catch (e) {}
    statusListeners.forEach((fn) => fn(unlocked));
  }

  function isUnlockedCached() {
    try {
      return localStorage.getItem(CACHE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function init() {
    if (!available) {
      // No native billing plugin present (browser preview / not yet built).
      notify(isUnlockedCached());
      return;
    }

    const { store, ProductType, Platform } = CdvPurchase;

    store.register({
      id: PRODUCT_ID,
      type: ProductType.NON_CONSUMABLE,
      platform: Platform.GOOGLE_PLAY,
    });

    store.when(PRODUCT_ID).approved((transaction) => transaction.verify());
    store.when(PRODUCT_ID).verified((receipt) => receipt.finish());
    store.when(PRODUCT_ID).owned(() => notify(true));

    store.error((err) => {
      console.error('[InvisibleStrikeBilling] store error', err);
    });

    store.ready(() => {
      ready = true;
      const product = store.get(PRODUCT_ID);
      if (product && product.owned) notify(true);
      const offer = product && product.getOffer ? product.getOffer() : null;
      if (offer && offer.pricingPhases && offer.pricingPhases[0]) {
        priceString = offer.pricingPhases[0].price;
      }
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }

  function purchase() {
    if (!available) {
      return Promise.reject(new Error('Billing unavailable in this preview. Install the Android app to unlock.'));
    }
    const { store } = CdvPurchase;
    const product = store.get(PRODUCT_ID);
    if (!product) {
      return Promise.reject(new Error('Product not loaded yet — try again in a moment.'));
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

  global.InvisibleStrikeBilling = {
    init,
    purchase,
    restore,
    onStatusChange,
    isAvailable: () => available,
    isReady: () => ready,
    getPriceString: () => priceString,
    isUnlockedCached,
  };
})(window);

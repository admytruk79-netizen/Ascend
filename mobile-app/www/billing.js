/**
 * ASCEND Keys — Google Play Billing wrapper
 * Wraps cordova-plugin-purchase (CdvPurchase) so app.js never talks to the
 * billing plugin directly. Falls back to "unavailable" when the plugin
 * isn't present (e.g. previewing index.html in a desktop browser).
 */
(function (global) {
  const PRODUCT_ID = 'ascend_keys_premium_monthly';
  const CACHE_KEY = 'ascend_keys_sub_cached';

  let statusListeners = [];
  let ready = false;
  let available = typeof CdvPurchase !== 'undefined';
  let priceString = '$5.99/month';

  function notify(subscribed) {
    try {
      localStorage.setItem(CACHE_KEY, subscribed ? 'true' : 'false');
    } catch (e) {}
    statusListeners.forEach(fn => fn(subscribed));
  }

  function isSubscribedCached() {
    try {
      return localStorage.getItem(CACHE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function init() {
    if (!available) {
      // No native billing plugin present (browser preview / not yet built).
      notify(isSubscribedCached());
      return;
    }

    const { store, ProductType, Platform } = CdvPurchase;

    store.register({
      id: PRODUCT_ID,
      type: ProductType.PAID_SUBSCRIPTION,
      platform: Platform.GOOGLE_PLAY,
    });

    store.when(PRODUCT_ID).approved(transaction => transaction.verify());
    store.when(PRODUCT_ID).verified(receipt => receipt.finish());
    store.when(PRODUCT_ID).owned(() => notify(true));
    store.when(PRODUCT_ID).updated(product => {
      if (product && product.owned === false) notify(false);
    });

    store.error(err => {
      console.error('[AscendBilling] store error', err);
    });

    store.ready(() => {
      ready = true;
      const product = store.get(PRODUCT_ID);
      if (product && product.owned) notify(true);
      const offer = product && product.getOffer ? product.getOffer() : null;
      if (offer && offer.pricingPhases && offer.pricingPhases[0]) {
        priceString = offer.pricingPhases[0].price + '/month';
      }
    });

    store.initialize([Platform.GOOGLE_PLAY]);
  }

  function subscribe() {
    if (!available) {
      return Promise.reject(new Error('Billing unavailable in this preview. Install the Android app to subscribe.'));
    }
    const { store } = CdvPurchase;
    const product = store.get(PRODUCT_ID);
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
    getPriceString: () => priceString,
    isSubscribedCached,
  };
})(window);

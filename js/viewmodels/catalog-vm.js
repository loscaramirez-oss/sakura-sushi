/* ============================================================
   ViewModel del catálogo: expone el menú a la vista.
   ============================================================ */
(function (global) {
  "use strict";

  class CatalogViewModel {
    constructor(catalogService, gradientService, brandConfig) {
      this._catalog = catalogService;
      this._gradient = gradientService;
      this._brand = brandConfig;
    }

    get business() {
      return this._brand.business;
    }

    get banner() {
      return this._brand.banner;
    }

    get categories() {
      return this._catalog.categories;
    }

    category(catIdx) {
      return this._catalog.raw[catIdx];
    }

    gradientFor(item) {
      return this._gradient.gradientFor(item.name);
    }

    priceLabel(item) {
      return this._catalog.priceLabel(item);
    }

    basePrice(item) {
      return this._catalog.basePrice(item);
    }

    isPkg(item) {
      return !!item.package;
    }

    key(catIdx, itemIdx, variant) {
      return this._catalog.productKey(catIdx, itemIdx, variant);
    }

    cartItemName(item, variant) {
      return this._catalog.cartItemName(item, variant);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CatalogViewModel = CatalogViewModel;
})(window);

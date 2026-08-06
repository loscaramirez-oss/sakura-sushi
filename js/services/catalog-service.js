/* ============================================================
   Servicio de catálogo: acceso al menú, claves de producto,
   precios y nombres presentables.
   ============================================================ */
(function (global) {
  "use strict";

  class CatalogService {
    constructor(menuData, currency) {
      this._menu = menuData;
      this._currency = currency;
    }

    get raw() {
      return this._menu;
    }

    get categories() {
      return this._menu.map(function (cat) {
        return cat.name;
      });
    }

    getItem(catIdx, itemIdx) {
      const cat = this._menu[catIdx];
      return cat ? cat.items[itemIdx] : undefined;
    }

    productKey(catIdx, itemIdx, variant) {
      return catIdx + ":" + itemIdx + (variant ? ":" + variant.label : "");
    }

    findItem(key) {
      const clean = key.indexOf("pkg:") === 0 ? key.slice(4) : key;
      const parts = clean.split(":");
      const cat = +parts[0];
      const item = +parts[1];
      const menuItem = this.getItem(cat, item) || {};
      const variants = menuItem.variants || [];
      return {
        cat,
        item,
        variant: parts[2] ? variants.find(v => v.label === parts[2]) || null : null
      };
    }

    getPrice(item, variant) {
      return variant ? variant.price : item.price;
    }

    basePrice(item) {
      if (typeof item.price === "number") return item.price;
      if (item.variants && item.variants.length) {
        return Math.min.apply(null, item.variants.map(function (v) {
          return v.price;
        }));
      }
      return 0;
    }

    priceLabel(item) {
      if (typeof item.price === "number") {
        return this._currency.format(item.price);
      }
      return "Desde " + this._currency.format(this.basePrice(item));
    }

    cartItemName(item, variant) {
      return item.name + (variant ? " · " + variant.label : "");
    }

    pkgCountOf(item) {
      return (item && item.package && item.package.count) || 2;
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CatalogService = CatalogService;
})(window);

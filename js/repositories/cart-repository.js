/* ============================================================
   Repositorio del carrito: lee y persiste el carrito en JSON.
   El nombre de la llave depende del prefijo de la marca.
   ============================================================ */
(function (global) {
  "use strict";

  class CartRepository {
    constructor(storage, storagePrefix) {
      this._storage = storage;
      this._key = storagePrefix + "Cart";
    }

    load() {
      try {
        return JSON.parse(this._storage.get(this._key) || "[]");
      } catch (e) {
        return [];
      }
    }

    save(cart) {
      this._storage.set(this._key, JSON.stringify(cart));
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CartRepository = CartRepository;
})(window);

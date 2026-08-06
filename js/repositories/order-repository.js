/* ============================================================
   Repositorio de pedidos: folio, historial y último pedido.
   Almacena en JSON con prefijo de la marca.
   ============================================================ */
(function (global) {
  "use strict";

  class OrderRepository {
    constructor(storage, storagePrefix) {
      this._storage = storage;
      this._ordersKey = storagePrefix + "Orders";
      this._folioKey = storagePrefix + "Folio";
      this._lastKey = storagePrefix + "LastOrder";
      this._maxOrders = 200;
    }

    nextFolio() {
      const n = this.lastFolio() + 1;
      this._storage.set(this._folioKey, String(n));
      return n;
    }

    lastFolio() {
      const v = parseInt(this._storage.get(this._folioKey) || "0", 10);
      return isNaN(v) ? 0 : v;
    }

    save(order) {
      const orders = this.orders();
      orders.push(order);
      if (orders.length > this._maxOrders) orders.splice(0, orders.length - this._maxOrders);
      this._storage.set(this._ordersKey, JSON.stringify(orders));
      this._storage.set(this._lastKey, JSON.stringify(order));
    }

    orders() {
      try {
        return JSON.parse(this._storage.get(this._ordersKey) || "[]");
      } catch (e) {
        return [];
      }
    }

    lastOrder() {
      try {
        return JSON.parse(this._storage.get(this._lastKey) || "null");
      } catch (e) {
        return null;
      }
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.OrderRepository = OrderRepository;
})(window);

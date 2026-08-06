/* ============================================================
   Modelo CartItem: forma de una línea del carrito.
   ============================================================ */
(function (global) {
  "use strict";

  const CartItem = {
    create(key, name, price, qty) {
      return { key, name, price, qty };
    },
    lineTotal(item) {
      return item.price * item.qty;
    }
  };

  global.PosApp = global.PosApp || {};
  global.PosApp.CartItem = CartItem;
})(window);

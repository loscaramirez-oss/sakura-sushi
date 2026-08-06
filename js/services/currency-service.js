/* ============================================================
   Servicio de moneda: formato de precios en pesos mexicanos.
   ============================================================ */
(function (global) {
  "use strict";

  class CurrencyService {
    format(value) {
      return "$" + value.toLocaleString("es-MX");
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CurrencyService = CurrencyService;
})(window);

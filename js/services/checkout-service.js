/* ============================================================
   Servicio de checkout: construye el mensaje de WhatsApp
   y la URL wa.me del pedido.
   ============================================================ */
(function (global) {
  "use strict";

  class CheckoutService {
    constructor(currency) {
      this._currency = currency;
    }

    buildMessage(options) {
      const L = [];
      L.push("*" + options.business + "*");
      L.push("*NUEVO PEDIDO*");
      L.push("");
      L.push("*Nombre:* " + options.name);
      L.push("*Teléfono:* " + options.phone);
      L.push("*Tipo:* " + (options.orderType === "domicilio" ? "A domicilio" : "Para llevar"));
      if (options.orderType === "domicilio") {
        L.push("*Dirección:* " + options.address);
        L.push("*Envío:* costo extra según mi ubicación");
      }
      L.push("*Pago:* " + options.payment);
      L.push("");
      L.push("*PEDIDO*");
      options.cart.forEach(function (c) {
        L.push(c.qty + " x " + c.name + "  =  " + this._currency.format(c.price * c.qty));
      }, this);
      L.push("");
      L.push("*TOTAL: " + this._currency.format(options.total) + "*");
      L.push("");
      L.push(options.loyaltyLine);
      if (options.notes) {
        L.push("");
        L.push("*Cambios al platillo:*");
        L.push(options.notes);
      }
      L.push("");
      L.push("*Salsas:* " + (options.salsas || "Sin comentario"));
      L.push("*Palitos:* " + (options.palitos === "Si" ? "Sí" : "No"));
      if (options.orderType === "domicilio") {
        L.push("");
        L.push("📍 *Adjunto mi ubicación*");
      }
      return L.join("\n");
    }

    waUrl(whatsapp, message) {
      return "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(message);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CheckoutService = CheckoutService;
})(window);

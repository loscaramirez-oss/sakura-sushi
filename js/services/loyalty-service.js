/* ============================================================
   Servicio de fidelidad: reglas de la tarjeta de 8 visitas.
   ============================================================ */
(function (global) {
  "use strict";

  class LoyaltyService {
    constructor(repository) {
      this._repository = repository;
    }

    load() {
      return this._repository.load();
    }

    registerVisit(cycle) {
      let next = cycle + 1;
      if (next >= 8) next = 0;
      this._repository.save(next);
      return next;
    }

    statusText(cycle) {
      if (cycle === 7) return "🎉 ¡Tu próxima visita (#8) tiene 10% OFF!";
      const missing = cycle === 0 ? 8 : 8 - cycle;
      return "Te faltan " + missing + " visitas para tu 10% OFF.";
    }

    line(cycle) {
      const visit = cycle + 1;
      let text = "*Tarjeta de fidelidad:* Visita #" + visit;
      if (visit === 8) {
        text += "\n🎉 *10% OFF en esta visita* (la tarjeta se reinicia)";
      } else {
        text += "\nTe faltan " + (8 - cycle) + " para tu 10% OFF";
      }
      return text;
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.LoyaltyService = LoyaltyService;
})(window);

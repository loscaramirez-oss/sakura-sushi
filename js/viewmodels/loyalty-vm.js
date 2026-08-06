/* ============================================================
   ViewModel de fidelidad: ciclo de visitas para 10% OFF.
   ============================================================ */
(function (global) {
  "use strict";

  class LoyaltyViewModel {
    constructor(loyaltyService) {
      this._service = loyaltyService;
      this.cycle = this._service.load();
    }

    get statusText() {
      return this._service.statusText(this.cycle);
    }

    registerVisit() {
      this.cycle = this._service.registerVisit(this.cycle);
      return this.line();
    }

    line() {
      return this._service.line(this.cycle);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.LoyaltyViewModel = LoyaltyViewModel;
})(window);

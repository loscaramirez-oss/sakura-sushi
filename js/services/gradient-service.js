/* ============================================================
   Servicio de degradados: color determinista por nombre del platillo.
   ============================================================ */
(function (global) {
  "use strict";

  class GradientService {
    constructor() {
      this._grads = [
        ["#ff7ab8", "#e8367c"],
        ["#e8367c", "#9e1c52"],
        ["#ffc23d", "#d4a017"],
        ["#ff5e9c", "#c21f5e"],
        ["#4a2b3a", "#1c0d14"],
        ["#e8b13c", "#b4751e"],
        ["#c85a9a", "#7e2a63"],
        ["#ff90c0", "#d8447e"]
      ];
    }

    gradientFor(name) {
      let h = 0;
      for (let i = 0; i < name.length; i++) {
        h = (h * 31 + name.charCodeAt(i)) >>> 0;
      }
      const g = this._grads[h % this._grads.length];
      return "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")";
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.GradientService = GradientService;
})(window);

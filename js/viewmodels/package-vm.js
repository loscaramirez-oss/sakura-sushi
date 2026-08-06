/* ============================================================
   ViewModel del paquete: selector de rollos dentro de un paquete.
   ============================================================ */
(function (global) {
  "use strict";

  class PackageViewModel {
    constructor(catalogService) {
      this._catalog = catalogService;
    }

    countOf(item) {
      return this._catalog.pkgCountOf(item);
    }

    rollsOf(item) {
      return item.package.rolls;
    }

    selectionMessage(item, selected) {
      const n = this.countOf(item);
      const missing = n - selected.length;
      if (missing > 0) {
        return "Elige " + missing + " rollo" + (missing === 1 ? "" : "s") + " más.";
      }
      return "¡Listo! Se agregó al carrito.";
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.PackageViewModel = PackageViewModel;
})(window);

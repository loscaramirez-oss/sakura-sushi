/* ============================================================
   Repositorio de fidelidad: ciclo de 8 visitas para el 10% OFF.
   Incluye la migración de las llaves antiguas (Visits/Total).
   ============================================================ */
(function (global) {
  "use strict";

  class LoyaltyRepository {
    constructor(storage, storagePrefix) {
      this._storage = storage;
      this._cycleKey = storagePrefix + "Cycle";
      this._visitsKey = storagePrefix + "Visits";
      this._totalKey = storagePrefix + "Total";
    }

    load() {
      let cycle = parseInt(this._storage.get(this._cycleKey) || "0", 10);
      const oldVisits = parseInt(this._storage.get(this._visitsKey) || "0", 10);

      if (oldVisits > 0 && !this._storage.get(this._cycleKey)) {
        cycle = oldVisits % 8;
        this._storage.set(this._cycleKey, String(cycle));
        this._storage.remove(this._visitsKey);
      }
      this._storage.remove(this._totalKey);

      return cycle;
    }

    save(cycle) {
      this._storage.set(this._cycleKey, String(cycle));
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.LoyaltyRepository = LoyaltyRepository;
})(window);

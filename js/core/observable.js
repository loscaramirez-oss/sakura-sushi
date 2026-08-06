/* ============================================================
   Observable: mecanismo mínimo de suscripción a eventos.
   Permite que las Vistas reaccionen a los cambios de los ViewModels.
   ============================================================ */
(function (global) {
  "use strict";

  class Observable {
    constructor() {
      this._listeners = new Map();
    }

    on(event, fn) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event).add(fn);
      const self = this;
      return function off() {
        self.off(event, fn);
      };
    }

    off(event, fn) {
      const set = this._listeners.get(event);
      if (set) {
        set.delete(fn);
      }
    }

    emit(event, payload) {
      const set = this._listeners.get(event);
      if (!set) return;
      set.forEach(function (fn) {
        fn(payload);
      });
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.Observable = Observable;
})(window);

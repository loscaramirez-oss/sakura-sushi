/* ============================================================
   Contenedor de inyección de dependencias (DI).
   Registra servicios por nombre y los resuelve de forma perezosa.
   ============================================================ */
(function (global) {
  "use strict";

  class Container {
    constructor() {
      this._registrations = new Map();
    }

    register(name, factory) {
      this._registrations.set(name, { factory, singleton: false, instance: null });
      return this;
    }

    registerSingleton(name, factory) {
      this._registrations.set(name, { factory, singleton: true, instance: null });
      return this;
    }

    resolve(name) {
      const reg = this._registrations.get(name);
      if (!reg) {
        throw new Error("[DI] Servicio no registrado: " + name);
      }
      if (reg.singleton) {
        if (!reg.instance) {
          reg.instance = reg.factory(this);
        }
        return reg.instance;
      }
      return reg.factory(this);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.Container = Container;
})(window);

/* ============================================================
   Repositorio de almacenamiento.
   StorageRepository = interfaz (contrato) de persistencia clave/valor.
   LocalStorageRepository = implementación sobre window.localStorage.
   ============================================================ */
(function (global) {
  "use strict";

  class StorageRepository {
    get(key) {
      throw new Error("StorageRepository.get(key) no implementado.");
    }
    set(key, value) {
      throw new Error("StorageRepository.set(key, value) no implementado.");
    }
    remove(key) {
      throw new Error("StorageRepository.remove(key) no implementado.");
    }
  }

  class LocalStorageRepository extends StorageRepository {
    get(key) {
      return window.localStorage.getItem(key);
    }
    set(key, value) {
      window.localStorage.setItem(key, value);
    }
    remove(key) {
      window.localStorage.removeItem(key);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.StorageRepository = StorageRepository;
  global.PosApp.LocalStorageRepository = LocalStorageRepository;
})(window);

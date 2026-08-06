/* ============================================================
   CONFIGURACIÓN DE MARCA
   Edita aquí: negocio, WhatsApp, teléfono y prefijo de almacenamiento.
   ============================================================ */
(function (global) {
  "use strict";

  global.PosApp = global.PosApp || {};
  global.PosApp.brandConfig = {
    business: "Sakura Sushi Paseos Mid",
    marca: "sakura",
    whatsapp: "529993614410",
    phoneDisplay: "999 361 4410",
    banner: "Pide por WhatsApp",
    storagePrefix: "sakura",
    /* Panel admin (Supabase). Pega aquí la URL y la anon key del proyecto
       (configuración → API). Con esto cada pedido se guarda en la nube y
       lo ve el receptor en la PC. Déjalo en blanco para desactivarlo. */
    supabase: {
      url: "https://edquyomwiiaawqslsisd.supabase.co",
      key: "sb_publishable_aIIwHt4T8cDIeZjy48hRxQ_sdY7_QIf"
    }
  };
})(window);

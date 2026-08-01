/* ============================================================
   SAKURA SUSHI - CONFIGURACIÓN Y MENÚ
   Edita aquí: número de WhatsApp, nombre del negocio, productos y precios.
   Reglas:
   - Para añadir un producto: copia una línea { name: "...", price: 0 }
   - Un producto puede tener "variants" (ej. sabores) con distinto precio.
   - Acentos y emojis funcionan normal.
   ============================================================ */
const CONFIG = {
  business: "Sakura Sushi Paseos Mid",
  whatsapp: "529993614410",
  phoneDisplay: "999 361 4410",
  banner: "Pide por WhatsApp"
};

const MENU = [
  {
    name: "Entradas",
    items: [
      { name: "Gohan Tampico", desc: "Arroz al vapor con salsa tampico, bañado con ajonjolí negro.", price: 80 },
      { name: "Gohan Spicy", desc: "Arroz al vapor con salsa spicy, ajonjolí y aguacate.", variants: [
        { label: "Camarón", price: 99 },
        { label: "Salmón", price: 99 },
        { label: "Arrachera", price: 90 },
        { label: "Pollo", price: 90 }
      ]},
      { name: "Yakimeshi", desc: "Arroz a la plancha bañado en soya, con verduras, pollo, res o camarón.", price: 95 },
      { name: "Yakimeshi Mixto", desc: "Arroz a la plancha bañado en soya con proteínas mixtas.", price: 125 },
      { name: "Edamames", desc: "Vainas de soya a la plancha salteadas con vinagreta de la casa.", price: 75 },
      { name: "Papas a la Francesa", desc: "", price: 55 },
      { name: "Dedos de Queso Gouda (3 pzas)", desc: "", price: 60 },
      { name: "Dedos de Queso Philadelphia (3 pzas)", desc: "", price: 60 },
      { name: "Oniguri de Philadelphia Empanizado (4 pzas)", desc: "", price: 70 }
    ]
  },
  {
    name: "Extras",
    items: [
      { name: "Tampico", desc: "", price: 30 },
      { name: "Pollo (40 gr)", desc: "", price: 25 },
      { name: "Res (40 gr)", desc: "", price: 25 },
      { name: "Camarón (40 gr)", desc: "", price: 35 }
    ]
  },
  {
    name: "Sopas",
    items: [
      { name: "Ramen de Pollo", desc: "", price: 135, featured: true, emoji: "🍜" },
      { name: "Ramen de Arrachera", desc: "", price: 135 },
      { name: "Ramen de Camarón", desc: "", price: 155 },
      { name: "Ramen de Salmón", desc: "", price: 135 }
    ]
  },
  {
    name: "Especiales",
    items: [
      { name: "Rollitos Primavera (2 pzas)", desc: "", price: 45 },
      { name: "Pasta Udon con Pollo", desc: "Con verduras, calabaza y zanahoria, pimiento, bañadas en soya y marinadas con salsa de la casa, acompañadas de pollo a la plancha.", price: 125, available: false },
      { name: "Sakura Balls (4 pzas)", desc: "", price: 105 },
      { name: "Tiras de Pollo (8 pzas)", desc: "", price: 79 }
    ]
  },
  {
    name: "Rollos Clásicos",
    items: [
      { name: "Yasai Tempura", desc: "PF: Verduras capeadas · PD: aguacate, philadelphia y surimi.", price: 99 },
      { name: "Nori Maki", desc: "PF: Alga · PD: philadelphia, aguacate, pepino y surimi.", price: 90 },
      { name: "Yoko Roll", desc: "PF: Tampico chipotle · PD: philadelphia, aguacate, cebollín y surimi empanizado.", price: 90 },
      { name: "Kiroi Pollito", desc: "PF: Queso gratinado · PD: aguacate y pollo empanizado.", price: 90 },
      { name: "Torii", desc: "PF: Tampico y ajonjolí · PD: philadelphia, pepino, aguacate y surimi.", price: 85 },
      { name: "California", desc: "PF: Ajonjolí · PD: philadelphia, pepino, aguacate y surimi.", price: 90, featured: true, emoji: "🥑" },
      { name: "Nevadito", desc: "PF: Philadelphia · PD: aguacate y camarón empanizado.", price: 90 },
      { name: "Dragon", desc: "PF: Aguacate, masago y cebollín · PD: philadelphia, pepino y camarón empanizado.", price: 105, featured: true, emoji: "🐉" }
    ]
  },
  {
    name: "Rollos Empanizados",
    items: [
      { name: "Matt Roll", desc: "PF: Empanizado y queso gratinado · PD: philadelphia, aguacate y pollo empanizado.", price: 115 },
      { name: "Sumo", desc: "PF: Philadelphia y empanizado · PD: arrachera, queso gouda, aguacate y camarón.", price: 119 },
      { name: "Eby Furai", desc: "PF: Empanizado y tampico · PD: philadelphia, camarón empanizado y aguacate.", price: 120 },
      { name: "Sake Furai", desc: "PF: Empanizado y tampico · PD: philadelphia, camarón empanizado, salmón y aguacate.", price: 130 },
      { name: "Tempura Roll", desc: "PF: Capeado con salsa de anguila y ajonjolí · PD: philadelphia, aguacate y surimi.", price: 99 },
      { name: "Okinawa", desc: "PF: Empanizado · PD: tocino, pollo a la plancha, piña y queso gouda.", price: 120, featured: true, emoji: "🥓" },
      { name: "Coco Hot", desc: "PF: Empanizado de coco y tampico en salsa chipotle · PD: philadelphia, camarón empanizado, piña y coco.", price: 120, featured: true, emoji: "🥥" },
      { name: "Cantinflas", desc: "PF: Queso gouda, empanizado y guacamole · PD: aguacate, arrachera con queso gratinado y cebolla.", price: 120 }
    ]
  },
  {
    name: "Rollos Tropicales",
    items: [
      { name: "Banana Roll", desc: "PF: Plátano macho frito · PD: philadelphia, pepino, aguacate y surimi.", price: 89 },
      { name: "Arcoiris Roll", desc: "PF: Kiwi, philadelphia, fresa y mango por temporada · PD: camarón empanizado, pepino y aguacate.", price: 105 },
      { name: "Fresita Maki", desc: "PF: Philadelphia y fresa · PD: pollo empanizado, pepino y piña.", price: 95 },
      { name: "Kiwi Roll", desc: "PF: Kiwi y philadelphia · PD: camarón, pepino y aguacate.", price: 99 },
      { name: "Geisha", desc: "PF: Philadelphia y aguacate · PD: philadelphia, pepino, piña y surimi.", price: 89 },
      { name: "Hawaii", desc: "PF: Philadelphia, piña y togarashi · PD: pepino, aguacate y camarón empanizado.", price: 99 }
    ]
  },
  {
    name: "Rollos Fusión",
    items: [
      { name: "Nacho Roll", desc: "PF: Philadelphia y doritos · PD: arrachera con queso gratinado.", price: 105 },
      { name: "Flamin Roll", desc: "PF: Philadelphia y flamin hot · PD: aguacate, pepino y pollo a la plancha.", price: 100 },
      { name: "Pink Roll", desc: "PF: Hoja rosa · PD: aguacate, philadelphia y pollo a la plancha.", price: 110 },
      { name: "Ondori", desc: "PF: Queso philadelphia y queso de bola con salsa frambuesa · PD: pollo capeado, aguacate y pepino.", price: 115 },
      { name: "Yaki Sake", desc: "PF: Salmón a la plancha, philadelphia y cebollín · PD: philadelphia, aguacate y pepino.", price: 125 },
      { name: "Sake", desc: "PF: Salmón · PD: aguacate, philadelphia y pepino.", price: 125, featured: true, emoji: "🍣" },
      { name: "Maguro", desc: "PF: Atún · PD: pepino, aguacate y philadelphia.", price: 115 },
      { name: "Eby", desc: "PF: Camarón · PD: philadelphia, aguacate y pepino.", price: 115 },
      { name: "Kani Kani Roll", desc: "PF: Aguacate, kanikama y camarón empanizado · PD: pepino, philadelphia y camarón empanizado.", price: 135 }
    ]
  },
  {
    name: "Rollos Flameados",
    items: [
      { name: "Tokio", desc: "PF: Salsa spicy con queso gratinado, salseado con salsa de anguila y ajonjolí mixto · PD: philadelphia, aguacate y surimi.", price: 130 },
      { name: "Cowboy", desc: "PF: Queso gratinado con salsa spicy · PD: chistorra, arrachera, aguacate y chiles toreados.", price: 145 },
      { name: "Hiroshima", desc: "PF: Salmón flameado con salsa frambuesa · PD: camarón empanizado, philadelphia y aguacate.", price: 145 },
      { name: "Mexicanito Roll", desc: "PF: Gratinado con chistorra y guacamole · PD: philadelphia, arrachera, aguacate y piña.", price: 145 },
      { name: "Tuna Hot", desc: "PF: Atún flameado con salsa spicy y sriracha con cebollín · PD: camarón empanizado, philadelphia y aguacate.", price: 145, featured: true, emoji: "🐟" },
      { name: "Kiroi Xcatic", desc: "PF: Queso gratinado spicy y cebollín · PD: aguacate, pollo empanizado y chile x'catic.", price: 130, featured: true, emoji: "🌶️" }
    ]
  },
  {
    name: "Paquetes y Promos",
    items: [
      { name: "2 Rollos x $150", desc: "Elige 2 rollos de: Banana Roll, California, Furai de Surimi, Furai de Pollo, Kiroi Pollito, Chipotle Roll o Philadelphia. Puedes repetir el mismo.", price: 150, package: { count: 2, rolls: ["Banana Roll", "California", "Furai de Surimi", "Furai de Pollo", "Kiroi Pollito", "Chipotle Roll", "Philadelphia"] } },
      { name: "Super Paquete 4 Rollos x $379", desc: "Elige 4 rollos de: Furai de Pollo, Furai de Surimi, Kiroi Pollito, California, Banana Roll, Chipotle Roll u Okinawa. Puedes repetir el mismo. Incluye 3 onigiris empanizados rellenos de queso philadelphia, 1 orden de papas a la francesa y 2 bebidas Nestea.", price: 379, package: { count: 4, rolls: ["Furai de Pollo", "Furai de Surimi", "Kiroi Pollito", "California", "Banana Roll", "Chipotle Roll", "Okinawa"] } },
      { name: "Sakura Lunch", desc: "Elige 1 rollo de: Furai de Pollo, Furai de Surimi, Kiroi Pollito, California, Banana Roll, Chipotle Roll u Okinawa. Incluye medio yakimeshi de pollo, 1 dedo de queso gouda y 1 bebida Nestea fría.", price: 145, package: { count: 1, rolls: ["Furai de Pollo", "Furai de Surimi", "Kiroi Pollito", "California", "Banana Roll", "Chipotle Roll", "Okinawa"] } },
      { name: "2 Yakimeshi de Pollo x $160", desc: "2 órdenes de yakimeshi de pollo.", price: 160 }
    ]
  },
  {
    name: "Bebidas",
    items: [
      { name: "Nestea Refil", desc: "", price: 40 },
      { name: "Agua Natural Embotellada", desc: "", price: 25 },
      { name: "Fuzetea", desc: "", price: 29 },
      { name: "Agua Avia 500 ml", desc: "Naranja, limón, tamarindo, jamaica y horchata.", price: 29 },
      { name: "Coca Cola 600 ml", desc: "", price: 34 }
    ]
  }
];

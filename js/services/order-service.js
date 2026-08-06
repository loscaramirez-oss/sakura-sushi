/* ============================================================
   Servicio de pedidos: folios, registro de pedidos y CSV.
   ============================================================ */
(function (global) {
  "use strict";

  class OrderService {
    constructor(currency) {
      this._currency = currency;
    }

    folioText(n) {
      return ("000" + String(n)).slice(-4);
    }

    buildRecord(fields) {
      return {
        folio: this.folioText(fields.folio),
        date: new Date().toISOString(),
        name: fields.name,
        phone: fields.phone,
        orderType: fields.orderType,
        address: fields.address || "",
        payment: fields.payment,
        notes: fields.notes || "",
        salsas: fields.salsas || "",
        palitos: fields.palitos || "",
        marca: fields.marca || "",
        items: (fields.cart || []).map(c => ({
          key: c.key,
          name: c.name,
          qty: c.qty,
          price: c.price,
          desc: c.desc || ""
        })),
        total: fields.total
      };
    }

    summarize(cart) {
      return cart.map(c => c.qty + " x " + c.name).join(", ");
    }

    csv(orders) {
      const esc = v => "\"" + String(v == null ? "" : v).replace(/"/g, "\"\"") + "\"";
      const head = ["folio", "fecha", "nombre", "telefono", "tipo", "direccion", "pago", "items", "total"];
      const rows = [head];
      orders.forEach(o => rows.push([
        o.folio,
        o.date,
        o.name,
        o.phone,
        o.orderType,
        o.address,
        o.payment,
        o.items.map(i => i.qty + " x " + i.name).join(" | "),
        o.total
      ]));
      return rows.map(r => r.map(esc).join(",")).join("\n");
    }

    notify(record, sheetsUrl) {
      if (!sheetsUrl) return Promise.resolve(false);
      return fetch(sheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      }).then(() => true).catch(() => false);
    }

    pushOrder(record, supabase) {
      if (!supabase || !supabase.url || !supabase.key) return Promise.resolve(false);
      return fetch(supabase.url.replace(/\/$/, "") + "/rest/v1/orders", {
        method: "POST",
        headers: {
          "apikey": supabase.key,
          "Authorization": "Bearer " + supabase.key,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          folio: record.folio,
          name: record.name,
          phone: record.phone,
          order_type: record.orderType,
          address: record.address,
          payment: record.payment,
          notes: record.notes || "",
          salsas: record.salsas || "",
          palitos: record.palitos || "",
          marca: record.marca || "",
          items: record.items,
          total: record.total
        })
      }).then(r => r.ok).catch(() => false);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.OrderService = OrderService;
})(window);

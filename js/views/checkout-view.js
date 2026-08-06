/* ============================================================
   Vista de checkout: formulario, resumen y envío a WhatsApp.
   ============================================================ */
(function (global) {
  "use strict";

  class CheckoutView {
    constructor(deps) {
      this.cart = deps.cartVM;
      this.checkout = deps.checkoutVM;
      this.loyalty = deps.loyaltyVM;
      this.currency = deps.currency;
      this.orderType = "llevar";
      this.payment = "Efectivo";
      this.palitos = "Si";
      this.e = {};
    }

    cache() {
      this.e = {
        fName: document.getElementById("fName"),
        fPhone: document.getElementById("fPhone"),
        optLlevar: document.getElementById("optLlevar"),
        optDomicilio: document.getElementById("optDomicilio"),
        deliveryNote: document.getElementById("deliveryNote"),
        fieldAddress: document.getElementById("fieldAddress"),
        fCalle: document.getElementById("fCalle"),
        fNumero: document.getElementById("fNumero"),
        fCruzamiento: document.getElementById("fCruzamiento"),
        fEspec: document.getElementById("fEspec"),
        optEfectivo: document.getElementById("optEfectivo"),
        optTransferencia: document.getElementById("optTransferencia"),
        fNotes: document.getElementById("fNotes"),
        fSalsas: document.getElementById("fSalsas"),
        optPalitosSi: document.getElementById("optPalitosSi"),
        optPalitosNo: document.getElementById("optPalitosNo"),
        checkoutItems: document.getElementById("checkoutItems"),
        checkoutTotal: document.getElementById("checkoutTotal")
      };
    }

    setType(t) {
      this.orderType = t;
      this.e.optLlevar.classList.toggle("active", t === "llevar");
      this.e.optDomicilio.classList.toggle("active", t === "domicilio");
      this.e.fieldAddress.classList.toggle("hidden", t !== "domicilio");
      this.e.deliveryNote.classList.toggle("hidden", t !== "domicilio");
    }

    setPayment(p) {
      this.payment = p;
      this.e.optEfectivo.classList.toggle("active", p === "Efectivo");
      this.e.optTransferencia.classList.toggle("active", p === "Transferencia");
    }

    setPalitos(v) {
      this.palitos = v;
      this.e.optPalitosSi.classList.toggle("active", v === "Si");
      this.e.optPalitosNo.classList.toggle("active", v === "No");
    }

    render() {
      this.e.checkoutItems.innerHTML = "";
      this.cart.items.forEach(c => {
        const line = document.createElement("div");
        line.className = "os-line";
        const l = document.createElement("span");
        l.textContent = c.qty + " x " + c.name;
        const r = document.createElement("span");
        r.textContent = this.currency.format(c.price * c.qty);
        line.appendChild(l); line.appendChild(r);
        this.e.checkoutItems.appendChild(line);
      });
      this.e.checkoutTotal.textContent = this.currency.format(this.cart.total);
    }

    _form() {
      const name = this.e.fName.value.trim();
      const phone = this.e.fPhone.value.trim();
      const calle = this.e.fCalle.value.trim();
      const numero = this.e.fNumero.value.trim();
      const cruzamiento = this.e.fCruzamiento.value.trim();
      const espec = this.e.fEspec.value.trim();
      const notes = this.e.fNotes.value.trim();
      const salsas = this.e.fSalsas.value.trim();

      if (!name) { alert("Escribe tu nombre."); return null; }
      if (!phone) { alert("Escribe tu teléfono."); return null; }
      if (this.orderType === "domicilio") {
        if (!calle) { alert("Escribe la calle de tu dirección."); return null; }
        if (!numero) { alert("Escribe el número de tu casa."); return null; }
        if (!cruzamiento) { alert("Escribe el cruzamiento de tu calle."); return null; }
      }

      let address = "";
      if (this.orderType === "domicilio") {
        address = calle + " #" + numero + ", cruce con " + cruzamiento;
        if (espec) address += " (" + espec + ")";
      }

      return { name, phone, address, notes, salsas, orderType: this.orderType, payment: this.payment, palitos: this.palitos };
    }

    send() {
      const form = this._form();
      if (!form) return;
      const data = this.checkout.orderData(this.cart.items, this.loyalty.line(), form);
      window.open(data.url, "_blank");
      this.checkout.recordOrder(data, form, this.cart.items);
      this.loyalty.registerVisit();
      this.onSent && this.onSent();
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.CheckoutView = CheckoutView;
})(window);

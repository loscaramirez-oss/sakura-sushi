/* ============================================================
   Vistas emergentes: selección de variante y paquetes de rollos.
   ============================================================ */
(function (global) {
  "use strict";

  class SheetView {
    constructor(deps) {
      this.currency = deps.currency;
      this.pkg = deps.pkgVM;
      this.e = {
        sheet: null, sheetName: null, sheetDesc: null, sheetOptions: null,
        pkgSheet: null, pkgTitle: null, pkgDesc: null, pkgOptions: null,
        pkgCount: null, pkgAdd: null
      };
      this.selectedVariant = null;
      this.pendingProduct = null;
      this.pkgSelected = [];
      this.pendingPkg = null;
      this.hooks = {
        onVariantConfirm: null,  // (ci, ii, item, variant)
        onPkgConfirm: null       // (ci, ii, item, selected)
      };
    }

    cache() {
      this.e.sheet = document.getElementById("sheet");
      this.e.sheetName = document.getElementById("sheetName");
      this.e.sheetDesc = document.getElementById("sheetDesc");
      this.e.sheetOptions = document.getElementById("sheetOptions");
      this.e.pkgSheet = document.getElementById("pkgSheet");
      this.e.pkgTitle = document.getElementById("pkgTitle");
      this.e.pkgDesc = document.getElementById("pkgDesc");
      this.e.pkgOptions = document.getElementById("pkgOptions");
      this.e.pkgCount = document.getElementById("pkgCount");
      this.e.pkgAdd = document.getElementById("pkgAdd");
    }

    /* ---------- Variante ---------- */
    openVariant(ci, ii, item) {
      this.selectedVariant = null;
      this.pendingProduct = { ci, ii, item };
      this.e.sheetName.textContent = item.name;
      this.e.sheetDesc.textContent = item.desc || "";
      this.e.sheetOptions.innerHTML = "";
      item.variants.forEach(v => {
        const opt = document.createElement("div");
        opt.className = "variant-opt";
        const s1 = document.createElement("span");
        s1.textContent = v.label;
        const s2 = document.createElement("span");
        s2.textContent = this.currency.format(v.price);
        opt.appendChild(s1); opt.appendChild(s2);
        opt.onclick = () => {
          this.selectedVariant = v;
          this.e.sheetOptions.querySelectorAll(".variant-opt").forEach(o => o.classList.remove("active"));
          opt.classList.add("active");
        };
        this.e.sheetOptions.appendChild(opt);
      });
      this._show(this.e.sheet);
    }

    confirmVariant() {
      if (!this.selectedVariant || !this.pendingProduct) return;
      const { ci, ii, item } = this.pendingProduct;
      this.hooks.onVariantConfirm && this.hooks.onVariantConfirm(ci, ii, item, this.selectedVariant);
      this.closeVariant();
    }

    closeVariant() {
      this._hide(this.e.sheet);
    }

    /* ---------- Paquete ---------- */
    openPkg(ci, ii, item) {
      const n = this.pkg.countOf(item);
      this.pendingPkg = { ci, ii, item };
      this.pkgSelected = [];
      this.e.pkgTitle.textContent = item.name;
      const repetir = n > 1 ? " Puedes repetir el mismo." : "";
      this.e.pkgDesc.textContent = "Elige " + n + (n === 1 ? " rollo:" : " rollos:") + repetir;
      this.e.pkgOptions.innerHTML = "";
      item.package.rolls.forEach(roll => {
        const opt = document.createElement("div");
        opt.className = "pkg-opt";
        opt.dataset.roll = roll;
        const check = document.createElement("span");
        check.className = "pkg-check";
        check.textContent = "○";
        const label = document.createElement("span");
        label.className = "pkg-label";
        label.textContent = roll;
        const leg = document.createElement("span");
        leg.className = "pkg-legend";
        leg.textContent = "$" + item.price;
        opt.appendChild(check); opt.appendChild(label); opt.appendChild(leg);
        opt.onclick = () => {
          const count = this.pkgSelected.filter(r => r === roll).length;
          if (count >= n) {
            this.pkgSelected.splice(this.pkgSelected.lastIndexOf(roll), 1);
          } else if (this.pkgSelected.length >= n) {
            alert("Solo puedes elegir " + n + (n === 1 ? " rollo." : " rollos."));
            return;
          } else {
            this.pkgSelected.push(roll);
          }
          this._updatePkgUI();
        };
        this.e.pkgOptions.appendChild(opt);
      });
      this._updatePkgUI();
      this._show(this.e.pkgSheet);
    }

    confirmPackage() {
      const n = this.pkg.countOf(this.pendingPkg ? this.pendingPkg.item : null);
      if (!this.pendingPkg || this.pkgSelected.length !== n) return;
      const { ci, ii, item } = this.pendingPkg;
      this.hooks.onPkgConfirm && this.hooks.onPkgConfirm(ci, ii, item, this.pkgSelected.slice());
      this.closePkg();
    }

    closePkg() {
      this._hide(this.e.pkgSheet);
    }

    _updatePkgUI() {
      const n = this.pkg.countOf(this.pendingPkg ? this.pendingPkg.item : null);
      this.e.pkgOptions.querySelectorAll(".pkg-opt").forEach(opt => {
        const roll = opt.dataset.roll;
        const count = this.pkgSelected.filter(r => r === roll).length;
        const check = opt.querySelector(".pkg-check");
        check.textContent = count > 0 ? "●" : "○";
        const lbl = opt.querySelector(".pkg-label");
        lbl.textContent = count > 1 ? roll + " ×" + count : roll;
        opt.classList.toggle("active", count > 0);
      });
      this.e.pkgCount.textContent = "Seleccionados: " + (this.pkgSelected.join(" + ") || "ninguno");
      const btn = this.e.pkgAdd;
      btn.disabled = this.pkgSelected.length !== n;
      const item = this.pendingPkg ? this.pendingPkg.item : null;
      btn.textContent = this.pkgSelected.length === n
        ? "Agregar " + this.currency.format(item.price)
        : "Agregar (" + this.pkgSelected.length + "/" + n + ")";
    }

    _show(el) {
      el.classList.remove("hidden");
      requestAnimationFrame(() => el.classList.add("show"));
    }

    _hide(el) {
      el.classList.remove("show");
      setTimeout(() => el.classList.add("hidden"), 280);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.SheetView = SheetView;
})(window);

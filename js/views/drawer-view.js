/* ============================================================
   Vista del carrito: drawer y carrito flotante.
   ============================================================ */
(function (global) {
  "use strict";

  class DrawerView {
    constructor(deps) {
      this.cart = deps.cartVM;
      this.currency = deps.currency;
      this.gradient = deps.gradient;
      this.hooks = {
        onQty: null,     // (key, delta)
        onRemove: null,  // (key)
        onClear: null
      };
    }

    renderDrawer(body, total, foot, clearBtn) {
      body.innerHTML = "";
      if (!this.cart.items.length) {
        body.innerHTML = '<div class="empty-cart"><div class="big">🛒</div>Tu pedido está vacío.<br>Agrega algo del menú.</div>';
        total.textContent = "$0";
        foot.classList.add("hidden");
        clearBtn.classList.add("hidden");
        return;
      }
      foot.classList.remove("hidden");
      clearBtn.classList.remove("hidden");

      this.cart.items.forEach(c => {
        body.appendChild(this._line(c));
      });
      total.textContent = this.currency.format(this.cart.total);
    }

    _line(c) {
      const line = document.createElement("div");
      line.className = "cart-line";

      const icon = document.createElement("div");
      icon.className = "item-icon mini";
      icon.style.background = this.gradient.gradientFor(c.name);
      icon.textContent = c.name.charAt(0);
      line.appendChild(icon);

      const main = document.createElement("div");
      main.className = "cl-main";

      const top = document.createElement("div");
      top.className = "cl-top";
      const n = document.createElement("div");
      n.className = "cl-name";
      n.textContent = c.name;
      const sub = document.createElement("div");
      sub.className = "cl-sub";
      sub.textContent = this.currency.format(c.price * c.qty);
      top.appendChild(n); top.appendChild(sub);

      const bottom = document.createElement("div");
      bottom.className = "cl-bottom";
      const pr = document.createElement("div");
      pr.className = "cl-price";
      pr.textContent = this.currency.format(c.price) + " c/u";
      bottom.appendChild(pr);

      const controls = document.createElement("div");
      controls.className = "cl-controls";

      const st = document.createElement("div");
      st.className = "stepper";
      const m = document.createElement("button");
      m.type = "button";
      m.setAttribute("aria-label", "Quitar uno");
      m.textContent = "−";
      m.onclick = () => this.hooks.onQty && this.hooks.onQty(c.key, -1);
      const s = document.createElement("span");
      s.textContent = c.qty;
      const p = document.createElement("button");
      p.type = "button";
      p.setAttribute("aria-label", "Agregar uno");
      p.textContent = "+";
      p.onclick = () => this.hooks.onQty && this.hooks.onQty(c.key, 1);
      st.appendChild(m); st.appendChild(s); st.appendChild(p);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "cl-remove";
      del.textContent = "🗑";
      del.setAttribute("aria-label", "Quitar platillo");
      del.title = "Quitar platillo";
      del.onclick = () => this.hooks.onRemove && this.hooks.onRemove(c.key);

      controls.appendChild(st); controls.appendChild(del);
      bottom.appendChild(controls);
      main.appendChild(top); main.appendChild(bottom);

      line.appendChild(main);
      return line;
    }

    refreshFloat(floatCart, badge, fcTotal) {
      const n = this.cart.count;
      if (n > 0) {
        floatCart.classList.remove("hidden");
        fcTotal.textContent = this.currency.format(this.cart.total);
        badge.classList.remove("hidden");
        badge.textContent = n;
      } else {
        floatCart.classList.add("hidden");
        badge.classList.add("hidden");
      }
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.DrawerView = DrawerView;
})(window);

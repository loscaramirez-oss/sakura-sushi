/* ============================================================
   Vista del menú: chips, tarjeta de fidelidad, tarjetas y secciones.
   Genera exactamente el mismo DOM que la app original.
   ============================================================ */
(function (global) {
  "use strict";

  const FEATURED = "⭐ Lo más pedido";

  class MenuView {
  constructor(deps) {
    this.catalog = deps.catalogVM;
    this.cart = deps.cartVM;
    this.loyalty = deps.loyaltyVM;
    this.currency = deps.currency;
    this.gradient = deps.gradient;
    this.pkg = deps.pkgVM;
    this.hooks = {
      onQty: null,          // (key, delta)
      onVariant: null,      // (ci, ii, item)
      onPkg: null,          // (ci, ii, item)
      onRemovePkg: null     // (ci, ii)
    };
    this.activeCat = FEATURED;
    this.nav = null;
    this.main = null;
  }

  attach(nav, main) {
    this.nav = nav;
    this.main = main;
    return this;
  }

  renderChips() {
    const nav = this.nav;
    nav.innerHTML = "";
    const cats = [FEATURED].concat(this.catalog.categories);
    cats.forEach(c => {
      const b = document.createElement("button");
      b.className = "chip" + (c === this.activeCat ? " active" : "");
      b.textContent = c;
      b.onclick = () => {
        this.activeCat = c;
        this.renderChips();
        this.renderMenu();
        window.scrollTo(0, 0);
      };
      nav.appendChild(b);
    });
  }

  renderMenu() {
    const main = this.main;
    main.innerHTML = "";
      main.appendChild(this._loyaltyCard());
      if (this.activeCat === FEATURED) {
        const h = document.createElement("div");
        h.className = "cat-title";
        h.textContent = FEATURED;
        main.appendChild(h);
        const list = document.createElement("div");
        list.className = "featured-scroll";
        this.catalog.categories.forEach((catName, ci) => {
          const cat = this.catalog.category(ci);
          cat.items.forEach((item, ii) => {
            if (item.featured) list.appendChild(this._featuredCard(ci, ii, item));
          });
        });
        main.appendChild(list);
      }
      this.catalog.categories.forEach((catName, ci) => {
        if (this.activeCat !== catName) return;
        const h = document.createElement("div");
        h.className = "cat-title";
        h.textContent = catName;
        main.appendChild(h);
        const list = document.createElement("div");
        list.className = "items";
        const cat = this.catalog.category(ci);
        cat.items.forEach((item, ii) => {
          list.appendChild(this._itemCard(ci, ii, item));
        });
        main.appendChild(list);
      });
      this._refreshLoyalty();
    }

    /* ---------- Tarjeta de fidelidad ---------- */
    _loyaltyCard() {
      const card = document.createElement("div");
      card.className = "loyalty-card";

      const head = document.createElement("div");
      head.className = "lc-head";
      const hleft = document.createElement("div");
      const title = document.createElement("div");
      title.className = "lc-title";
      title.textContent = "⭐ Tarjeta de Fidelidad";
      const status = document.createElement("div");
      status.className = "lc-status";
      status.id = "lcStatus";
      hleft.appendChild(title); hleft.appendChild(status);
      const count = document.createElement("div");
      count.className = "lc-count";
      const b = document.createElement("b");
      b.id = "lcVisits";
      const span = document.createElement("span");
      span.textContent = "visitas";
      count.appendChild(b); count.appendChild(span);
      head.appendChild(hleft); head.appendChild(count);

      const dots = document.createElement("div");
      dots.className = "lc-dots";
      dots.id = "lcDots";
      for (let i = 1; i <= 8; i++) {
        const d = document.createElement("div");
        d.className = "lc-dot" + (i === 8 ? " milestone" : "");
        d.textContent = i;
        d.dataset.n = i;
        dots.appendChild(d);
      }

      const foot = document.createElement("div");
      foot.className = "lc-foot";
      foot.innerHTML = "🎉 Visita #8 → <b>10% OFF</b> (la tarjeta se reinicia)<br><span>Al enviar tu pedido por WhatsApp se registra tu visita.</span>";

      card.appendChild(head);
      card.appendChild(dots);
      card.appendChild(foot);
      return card;
    }

    _refreshLoyalty() {
      const st = document.getElementById("lcStatus");
      const cnt = document.getElementById("lcVisits");
      if (!st) return;
      st.textContent = this.loyalty.statusText;
      cnt.textContent = "#" + this.loyalty.cycle;
      document.querySelectorAll("#lcDots .lc-dot").forEach(d => {
        const n = +d.dataset.n;
        d.classList.toggle("filled", n <= this.loyalty.cycle);
      });
    }

    /* ---------- Tarjetas ---------- */
    _featuredCard(ci, ii, item) {
      const div = document.createElement("div");
      div.className = "featured" + (item.available === false ? " off" : "");
      div.style.background = this.gradient.gradientFor(item.name);
      const key = this.catalog.key(ci, ii, null);
      const qty = this.cart.qtyOf(key);

      const star = document.createElement("span");
      star.className = "f-star";
      star.textContent = "⭐ Popular";
      div.appendChild(star);

      const em = document.createElement("div");
      em.className = "f-emoji";
      em.textContent = item.emoji || "🍣";
      div.appendChild(em);

      const n = document.createElement("div");
      n.className = "f-name";
      n.textContent = item.name;
      div.appendChild(n);

      const p = document.createElement("div");
      p.className = "f-price";
      p.textContent = this.catalog.priceLabel(item);
      div.appendChild(p);

      const area = document.createElement("div");
      area.className = "f-add";
      div.appendChild(area);
      this._renderAddButton(area, ci, ii, item, key, qty);
      return div;
    }

    _itemCard(ci, ii, item) {
      const div = document.createElement("div");
      div.className = "item" + (item.available === false ? " off" : "");
      const key = this.catalog.key(ci, ii, null);
      const qty = this.cart.qtyOf(key);

      div.appendChild(this._iconTile(item.name, item.emoji));

      const info = document.createElement("div");
      info.className = "item-info";
      const n = document.createElement("div");
      n.className = "item-name";
      n.textContent = item.name;
      info.appendChild(n);
      if (item.desc) {
        const d = document.createElement("div");
        d.className = "item-desc";
        d.textContent = item.desc;
        info.appendChild(d);
      }
      const pr = document.createElement("div");
      pr.className = "item-price";
      pr.textContent = this.catalog.priceLabel(item);
      info.appendChild(pr);
      div.appendChild(info);

      const area = document.createElement("div");
      area.className = "add-area";
      div.appendChild(area);
      if (item.package) {
        this._renderPkgButton(area, ci, ii, item);
      } else {
        this._renderAddButton(area, ci, ii, item, key, qty);
      }
      return div;
    }

    _iconTile(name, emoji) {
      const d = document.createElement("div");
      d.className = "item-icon";
      d.style.background = this.gradient.gradientFor(name);
      d.textContent = emoji || name.charAt(0);
      return d;
    }

    /* ---------- Botones de cantidad ---------- */
    _stepper(qty, onMinus, onPlus) {
      const st = document.createElement("div");
      st.className = "stepper";
      const m = document.createElement("button");
      m.type = "button";
      m.setAttribute("aria-label", "Quitar uno");
      m.textContent = "−";
      m.onclick = e => { e.stopPropagation(); onMinus(); };
      const s = document.createElement("span");
      s.textContent = qty;
      const p = document.createElement("button");
      p.type = "button";
      p.setAttribute("aria-label", "Agregar uno");
      p.textContent = "+";
      p.onclick = e => { e.stopPropagation(); onPlus(); };
      st.appendChild(m); st.appendChild(s); st.appendChild(p);
      return st;
    }

    _renderAddButton(area, ci, ii, item, key, qty) {
      area.innerHTML = "";
      if (item.available === false) {
        const badge = document.createElement("span");
        badge.className = "soldout";
        badge.textContent = "No disponible";
        area.appendChild(badge);
        return;
      }
      if (qty > 0) {
        area.appendChild(this._stepper(
          qty,
          () => this.hooks.onQty && this.hooks.onQty(key, -1),
          () => this.hooks.onQty && this.hooks.onQty(key, 1)
        ));
      } else {
        const b = document.createElement("button");
        b.className = item.variants ? "add-btn variant" : "add-btn";
        b.textContent = item.variants ? "Elegir" : "+";
        b.onclick = e => {
          e.stopPropagation();
          if (item.variants) {
            this.hooks.onVariant && this.hooks.onVariant(ci, ii, item);
          } else {
            this.hooks.onQty && this.hooks.onQty(key, 1);
          }
        };
        area.appendChild(b);
      }
    }

    /* ---------- Paquetes ---------- */
    _renderPkgButton(area, ci, ii, item) {
      area.innerHTML = "";
      const qty = this.cart.qtyOfPkg(ci, ii);
      if (qty > 0) {
        area.appendChild(this._stepper(
          qty,
          () => this.hooks.onRemovePkg && this.hooks.onRemovePkg(ci, ii),
          () => this.hooks.onPkg && this.hooks.onPkg(ci, ii, item)
        ));
      } else {
        const b = document.createElement("button");
        b.className = "add-btn variant";
        b.textContent = "Elegir " + this.pkg.countOf(item);
        b.onclick = () => this.hooks.onPkg && this.hooks.onPkg(ci, ii, item);
        area.appendChild(b);
      }
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.MenuView = MenuView;
})(window);

/* ============================================================
   Vista principal: coordina menú, drawer, checkout y sheets.
   Expone las funciones globales que usan los onclick del HTML.
   ============================================================ */
(function (global) {
  "use strict";

  class AppView {
    constructor(deps) {
      this.menu = deps.menuView;
      this.drawer = deps.drawerView;
      this.checkout = deps.checkoutView;
      this.sheets = deps.sheetView;
      this.cart = deps.cartVM;
      this.el = {};
    }

    init() {
      this.el = {
        menu: document.getElementById("menu"),
        cats: document.getElementById("cats"),
        floatCart: document.getElementById("floatCart"),
        badge: document.getElementById("badge"),
        fcTotal: document.getElementById("fcTotal"),
        overlay: document.getElementById("overlay"),
        drawer: document.getElementById("drawer"),
        clearBtn: document.getElementById("clearBtn"),
        drawerBody: document.getElementById("drawerBody"),
        drawerFoot: document.getElementById("drawerFoot"),
        drawerTotal: document.getElementById("drawerTotal"),
        checkout: document.getElementById("checkout")
      };

      this.checkout.cache();
      this.sheets.cache();

      this.menu.hooks.onQty = (key, delta) => this.cart.changeQty(key, delta);
      this.menu.hooks.onVariant = (ci, ii, item) => this.sheets.openVariant(ci, ii, item);
      this.menu.hooks.onPkg = (ci, ii, item) => this.sheets.openPkg(ci, ii, item);
      this.menu.hooks.onRemovePkg = (ci, ii) => this.cart.removeOnePackage(ci, ii);

      this.drawer.hooks.onQty = (key, delta) => this.cart.changeQty(key, delta);
      this.drawer.hooks.onRemove = key => this.cart.remove(key);
      this.drawer.hooks.onClear = () => this.cart.clear();

      this.sheets.hooks.onVariantConfirm = (ci, ii, item, variant) =>
        this.cart.changeQty(this.menu.catalog.key(ci, ii, variant), 1);
      this.sheets.hooks.onPkgConfirm = (ci, ii, item, selected) =>
        this.cart.addPackage(ci, ii, item, selected);

      this.checkout.onSent = () => this.refreshAll();

      this.cart.onChange = () => this.refreshAll();

      this.menu.attach(this.el.cats, this.el.menu);
      this.menu.renderChips();
      this.menu.renderMenu();
      this.refreshFloat();
    }

    openDrawer() {
      this.drawer.renderDrawer(this.el.drawerBody, this.el.drawerTotal, this.el.drawerFoot, this.el.clearBtn);
      this.el.drawer.classList.add("show");
      this.el.overlay.classList.add("show");
    }

    closeDrawer() {
      this.el.drawer.classList.remove("show");
      this.el.overlay.classList.remove("show");
    }

    clearCart() {
      this.cart.clear();
    }

    goCheckout() {
      this.closeDrawer();
      if (!this.cart.items.length) return;
      this.el.menu.classList.add("hidden");
      this.el.cats.classList.add("hidden");
      this.el.checkout.classList.remove("hidden");
      this.el.floatCart.classList.add("hidden");
      window.scrollTo(0, 0);
      this.checkout.render();
    }

    goBack() {
      this.el.checkout.classList.add("hidden");
      this.el.menu.classList.remove("hidden");
      this.el.cats.classList.remove("hidden");
      this.refreshFloat();
      window.scrollTo(0, 0);
    }

    editOrder() {
      this.goBack();
      setTimeout(() => this.openDrawer(), 60);
    }

    refreshAll() {
      this.menu.renderMenu();
      this.drawer.renderDrawer(this.el.drawerBody, this.el.drawerTotal, this.el.drawerFoot, this.el.clearBtn);
      this.refreshFloat();
    }

    refreshFloat() {
      this.drawer.refreshFloat(this.el.floatCart, this.el.badge, this.el.fcTotal);
    }
  }

  global.PosApp = global.PosApp || {};
  global.PosApp.AppView = AppView;
})(window);

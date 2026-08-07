/* ============================================================
   Configuración del panel admin.
   Pega aquí los datos de tu proyecto Supabase.
   ============================================================ */
const SUPABASE_URL = "https://edquyomwiiaawqslsisd.supabase.co";
const SUPABASE_KEY = "sb_publishable_aIIwHt4T8cDIeZjy48hRxQ_sdY7_QIf";

/* ============================================================
   Panel de pedidos de Sakura Sushi.
   Lee pedidos desde Supabase (REST), los muestra en tiempo real
   (polling) y permite cambiar su estado.
   ============================================================ */
(function () {
  "use strict";

  const API = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/orders";
  const HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY
  };

  const SESSION = "sakuraAdmin";

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const BRAND = (window.PosApp && window.PosApp.brandConfig) || {
    business: "Sakura Sushi Paseos Mid",
    address: "",
    phoneDisplay: ""
  };
  const MENU = (window.PosApp && window.PosApp.menuData) || [];

  const STATUS = {
    nuevo:      { label: "Nuevo",     cls: "s-nuevo" },
    recibido:   { label: "Recibido",  cls: "s-recibido" },
    listo:      { label: "Listo",     cls: "s-listo" },
    entregado:  { label: "Entregado", cls: "s-entregado" },
    cancelado:  { label: "Cancelado", cls: "s-cancelado" },
    archivado:  { label: "Archivado", cls: "s-archivado" }
  };

  const FLOW = ["nuevo", "recibido", "listo", "entregado"];

  let state = {
    orders: [],
    seen: new Set(),
    soundOn: true,
    onlyNew: false,
    showArch: false,
    pollTimer: null,
    autoPrint: true,
    pCat: 0
  };

  let newOrder = null;

  const $ = id => document.getElementById(id);

  /* ---------- Utilidades ---------- */
  const money = n => "$" + Number(n || 0).toLocaleString("es-MX");
  const fmtTime = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }) + " " +
      d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add("hidden"), 3500);
  }

  function beep() {
    try {
      const ctx = beep._ctx || (beep._ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.25;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch (e) { /* sin audio */ }
  }

  function notify(title, body) {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "../logo.png" });
      }
    } catch (e) { /* sin notificaciones */ }
  }

  /* ---------- Ticket de impresión ---------- */
  function ticketHtml(o) {
    const items = (o.items || []).map(i =>
      '<div class="t-row"><span>' + i.qty + " x " + esc(i.name) + "</span><span>" +
      money(i.price * i.qty) + "</span></div>" +
      (i.desc ? '<div class="t-desc">' + esc(i.desc) + "</div>" : "")
    ).join("");

    const type = o.order_type === "restaurante"
      ? "RESTAURANTE · " + (o.address || "Mesa")
      : o.order_type === "domicilio"
        ? "A DOMICILIO"
        : "PARA LLEVAR";

    return '<div class="ticket">' +
      '<div class="t-big">' + esc(BRAND.business) + "</div>" +
      (BRAND.address ? '<div class="t-center">' + esc(BRAND.address) + "</div>" : "") +
      (BRAND.phoneDisplay ? '<div class="t-center">Tel: ' + esc(BRAND.phoneDisplay) + "</div>" : "") +
      '<div class="t-sep"></div>' +
      '<div class="t-center t-big">PEDIDO #' + esc(o.folio) + "</div>" +
      '<div class="t-center">' + fmtTime(o.created_at || o.date) + "</div>" +
      '<div class="t-center"><b>' + esc(type) + "</b></div>" +
      (o.name ? '<div class="t-row"><span>Cliente</span><span>' + esc(o.name) + "</span></div>" : "") +
      (o.phone ? '<div class="t-row"><span>Tel</span><span>' + esc(o.phone) + "</span></div>" : "") +
      (o.order_type === "domicilio" && o.address ? '<div class="t-row"><span>Dirección</span><span>' + esc(o.address) + "</span></div>" : "") +
      (o.notes ? '<div class="t-row"><span>Notas</span><span>' + esc(o.notes) + "</span></div>" : "") +
      '<div class="t-sep"></div>' + items +
      '<div class="t-sep"></div>' +
      '<div class="t-total"><span>TOTAL</span><span>' + money(o.total) + "</span></div>" +
      '<div class="t-center">Pago: ' + esc(o.payment) + "</div>" +
      '<div class="t-sep"></div>' +
      '<div class="t-foot">¡Gracias por su compra!</div>' +
    "</div>";
  }

  function printTicket(o) {
    $("printArea").innerHTML = ticketHtml(o);
    window.print();
  }

  /* ---------- Nuevo pedido (restaurante / llevar / domicilio) ---------- */
  function nextFolio() {
    let max = 0;
    state.orders.forEach(o => {
      const n = parseInt(o.folio, 10);
      if (n > max) max = n;
    });
    const local = parseInt(localStorage.getItem("sakuraAdminFolio") || "0", 10);
    if (local > max) max = local;
    const next = max + 1;
    localStorage.setItem("sakuraAdminFolio", String(next));
    return ("000" + String(next)).slice(-4);
  }

  function catItems(ci) {
    return (MENU[ci] && MENU[ci].items) || [];
  }

  function priceOf(item) {
    if (typeof item.price === "number") return money(item.price);
    const vs = item.variants || [];
    const lo = Math.min.apply(null, vs.map(v => v.price));
    return "Desde " + money(lo);
  }

  function renderTabs() {
    $("noTabs").innerHTML = MENU.map((cat, i) =>
      '<button class="tab' + (i === state.pCat ? " on" : "") + '" data-i="' + i + '">' +
      esc(cat.name) + "</button>"
    ).join("");
  }

  function renderGrid() {
    const q = ($("noSearch").value || "").toLowerCase().trim();
    const matches = [];
    MENU.forEach((cat, ci) => {
      (cat.items || []).forEach((it, ii) => {
        if (q) {
          if ((it.name + " " + (it.desc || "") + " " + cat.name).toLowerCase().indexOf(q) < 0) return;
        } else if (state.pCat >= 0 && ci !== state.pCat) {
          return;
        }
        matches.push({ ci, ii, it });
      });
    });
    $("noGrid").innerHTML = matches.length
      ? matches.map(m =>
          '<button class="p-btn" data-ci="' + m.ci + '" data-ii="' + m.ii + '">' +
          "<span>" + esc(m.it.name) + "</span><em>" + priceOf(m.it) + "</em></button>"
        ).join("")
      : '<div class="empty p-empty">Sin resultados</div>';
  }

  function openVariants(ci, ii) {
    const it = catItems(ci)[ii];
    const vs = it.variants || [];
    $("noVariantList").innerHTML =
      '<div class="v-title">' + esc(it.name) + "</div>" +
      vs.map((v, vi) =>
        '<button class="v-btn" data-v="' + vi + '"><span>' + esc(v.label) + "</span><em>" +
        money(v.price) + "</em></button>"
      ).join("");
    $("noVariant").dataset.ci = ci;
    $("noVariant").dataset.ii = ii;
    $("noVariant").classList.remove("hidden");
  }

  function addToCart(ci, ii, variant) {
    const it = catItems(ci)[ii];
    const name = it.name + (variant ? " · " + variant.label : "");
    const price = variant ? variant.price : it.price;
    const key = ci + ":" + ii + (variant ? ":" + variant.label : "");
    const found = newOrder.cart.find(c => c.key === key);
    if (found) {
      found.qty += 1;
    } else {
      newOrder.cart.push({ key, name, qty: 1, price: price || 0, desc: it.desc || "" });
    }
    renderCart();
  }

  function renderCart() {
    const el = $("noItems");
    if (!newOrder.cart.length) {
      el.innerHTML = '<div class="empty">Aún no agregas platillos.</div>';
    } else {
      el.innerHTML = newOrder.cart.map((c, ix) =>
        '<div class="no-item">' +
          '<span class="no-name">' + esc(c.name) + "</span>" +
          '<div class="no-qty"><button data-ix="' + ix + '" data-d="-1">−</button><b>' + c.qty + "</b>" +
          '<button data-ix="' + ix + '" data-d="1">+</button></div>' +
          '<span class="no-line">' + money(c.price * c.qty) + "</span>" +
          '<button class="no-del" data-ix="' + ix + '" data-del="1">✕</button>' +
        "</div>"
      ).join("");
    }
    const total = newOrder.cart.reduce((a, c) => a + c.price * c.qty, 0);
    $("noTotal").textContent = money(total);
  }

  function setSegType(t) {
    newOrder.type = t;
    document.querySelectorAll("#segType .seg-btn").forEach(b => b.classList.toggle("on", b.dataset.t === t));
    $("rowMesa").classList.toggle("hidden", t !== "restaurante");
    $("rowPhone").classList.toggle("hidden", t === "restaurante");
    $("rowAddr").classList.toggle("hidden", t !== "domicilio");
  }

  function resetNewOrder() {
    newOrder = { type: "restaurante", cart: [] };
    $("noMesa").value = 1;
    $("noName").value = "";
    $("noPhone").value = "";
    $("noAddr").value = "";
    $("noPay").value = "Efectivo";
    $("noNotes").value = "";
    $("noSearch").value = "";
    state.pCat = 0;
    renderTabs();
    renderGrid();
    renderCart();
    setSegType("restaurante");
  }

  function closeNewOrder() {
    $("newOrderModal").classList.add("hidden");
  }

  async function saveNewOrder() {
    if (!newOrder || !newOrder.cart.length) {
      toast("Agrega al menos un platillo");
      return;
    }
    const type = newOrder.type;
    const mesa = parseInt($("noMesa").value || "1", 10);
    let name = ($("noName").value || "").trim();
    let address = "";
    if (type === "restaurante") {
      address = "Mesa " + (mesa || 1);
      if (!name) name = address;
    } else if (type === "domicilio") {
      address = ($("noAddr").value || "").trim();
    }
    const phone = type === "restaurante" ? "" : ($("noPhone").value || "").trim();
    const record = {
      folio: nextFolio(),
      name: name || "Cliente",
      phone,
      order_type: type,
      address,
      payment: $("noPay").value,
      notes: ($("noNotes").value || "").trim(),
      salsas: "",
      palitos: "No",
      marca: (BRAND.marca || ""),
      items: newOrder.cart.map(c => ({
        key: c.key,
        name: c.name,
        qty: c.qty,
        price: c.price,
        desc: c.desc
      })),
      total: newOrder.cart.reduce((a, c) => a + c.price * c.qty, 0)
    };
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json", "Prefer": "return=minimal" }, HEADERS),
        body: JSON.stringify(record)
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      closeNewOrder();
      toast("Pedido #" + record.folio + " enviado a cocina");
      refresh();
    } catch (e) {
      toast("Error al guardar el pedido");
    }
  }

  /* ---------- API ---------- */
  async function fetchOrders() {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    const q = API + "?select=*&marca=eq." + encodeURIComponent(BRAND.marca || "") + "&order=created_at.desc&limit=200";
    const r = await fetch(q, { headers: HEADERS });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  async function setStatus(id, status) {
    const r = await fetch(API + "?id=eq." + id, {
      method: "PATCH",
      headers: Object.assign({ "Content-Type": "application/json", "Prefer": "return=minimal" }, HEADERS),
      body: JSON.stringify({ status })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
  }

  /* ---------- Render ---------- */
  function statusBadge(s) {
    const d = STATUS[s] || STATUS.nuevo;
    return '<span class="st-badge ' + d.cls + '">' + d.label + "</span>";
  }

  function cardHtml(o) {
    const items = (o.items || []).map(i =>
      '<div class="o-item"><span>' + esc(i.name) + "</span><span class='x" + i.qty + "'>" +
      i.qty + " × " + money(i.price * i.qty) + "</span></div>"
    ).join("");

    const notes = (o.notes || o.salsas)
      ? '<div class="o-notes">' +
        (o.notes ? "<div>📝 " + esc(o.notes) + "</div>" : "") +
        (o.salsas ? "<div>🥫 " + esc(o.salsas) + "</div>" : "") +
        "</div>"
      : "";

    const flowBtns = FLOW.map(s => {
      const d = STATUS[s];
      return '<button class="fbtn' + (o.status === s ? " on" : "") + '" data-id="' + o.id + '" data-s="' + s + '">' +
        d.label + "</button>";
    }).join("");

    const typeLabel = o.order_type === "domicilio"
      ? "🛵 A domicilio · "
      : o.order_type === "restaurante"
        ? "🍽 Restaurante · "
        : "🛍️ Para llevar · ";
    const addrIcon = o.order_type === "domicilio" ? "📍" : "🍽";

    return '<div class="card' + (o.status === "nuevo" ? " card-new" : "") + '" data-id="' + o.id + '">' +
      '<div class="c-top">' +
        '<div class="c-left"><span class="c-folio">#' + esc(o.folio) + "</span>" + statusBadge(o.status) + "</div>" +
        '<span class="c-time">' + fmtTime(o.created_at) + "</span>" +
      "</div>" +
      '<div class="c-name">' + esc(o.name) + ' <span class="c-phone">📞 ' + esc(o.phone) + "</span></div>" +
      '<div class="c-meta">' + typeLabel + esc(o.payment) + "</div>" +
      ((o.order_type === "domicilio" || o.order_type === "restaurante") && o.address
        ? '<div class="c-addr">' + addrIcon + " " + esc(o.address) + "</div>" : "") +
      '<div class="o-items">' + items + "</div>" +
      notes +
      '<div class="c-total">Total <b>' + money(o.total) + "</b></div>" +
      '<div class="c-actions">' + flowBtns +
        '<button class="fbtn print" data-id="' + o.id + '" data-act="print">🖨</button>' +
        '<button class="fbtn archive" data-id="' + o.id + '" data-s="archivado">🗂</button>' +
      "</div>" +
    "</div>";
  }

  function render() {
    const list = $("orders");
    const orders = state.orders
      .filter(o => state.onlyNew ? o.status === "nuevo" : true)
      .filter(o => state.showArch ? true : o.status !== "archivado");

    if (!orders.length) {
      list.innerHTML = '<div class="empty">📭 No hay pedidos.</div>';
    } else {
      list.innerHTML = orders.map(cardHtml).join("");
    }
  }

  function renderStats() {
    const today = new Date().toDateString();
    const todayOrders = state.orders.filter(o => {
      if (!o.created_at) return false;
      return new Date(o.created_at).toDateString() === today;
    });
    $("stNuevos").textContent = state.orders.filter(o => o.status === "nuevo").length;
    $("stHoy").textContent = todayOrders.length;
    $("stIngresos").textContent = money(todayOrders.reduce((a, o) => a + (o.total || 0), 0));
  }

  /* ---------- Ciclo ---------- */
  async function refresh() {
    try {
      const orders = await fetchOrders();
      const before = state.orders.length;
      state.orders = orders;
      const isFirst = state.seen.size === 0;
      orders.forEach(o => {
        if (!state.seen.has(o.id)) {
          state.seen.add(o.id);
          if (!isFirst && o.status === "nuevo") {
            if (state.soundOn) beep();
            notify("Nuevo pedido #" + o.folio, (o.name || "") + " · " + money(o.total));
            if (state.autoPrint) printTicket(o);
          }
        }
      });
      $("refreshNote").textContent = "Actualizado " + new Date().toLocaleTimeString("es-MX");
      renderStats();
      render();
    } catch (e) {
      $("refreshNote").textContent = "Error de conexión";
      if (state.seen.size === 0) {
        $("orders").innerHTML = '<div class="empty">No se pudo conectar a Supabase.<br>Revisa la configuración en admin/admin.js.</div>';
      }
    }
  }

  function start() {
    clearInterval(state.pollTimer);
    state.pollTimer = setInterval(refresh, 4000);
  }

  /* ---------- CSV ---------- */
  function downloadCsv() {
    const escCsv = v => "\"" + String(v == null ? "" : v).replace(/"/g, "\"\"") + "\"";
    const rows = [["folio", "fecha", "estado", "nombre", "telefono", "tipo", "direccion", "pago", "items", "total"]];
    state.orders.forEach(o => rows.push([
      o.folio, o.created_at, o.status, o.name, o.phone, o.order_type, o.address, o.payment,
      (o.items || []).map(i => i.qty + " x " + i.name).join(" | "), o.total
    ]));
    const blob = new Blob(["\ufeff" + rows.map(r => r.map(escCsv).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sakura-pedidos.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  /* ---------- Eventos ---------- */
  function wire() {
    document.getElementById("orders").addEventListener("click", async e => {
      const btn = e.target.closest(".fbtn");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.act === "print") {
        const o = state.orders.find(x => x.id === id);
        if (o) printTicket(o);
        return;
      }
      const s = btn.dataset.s;
      try {
        await setStatus(id, s);
        refresh();
      } catch (err) {
        toast("Error al cambiar estado");
      }
    });

    $("soundToggle").addEventListener("change", e => { state.soundOn = e.target.checked; });
    $("autoPrintToggle").addEventListener("change", e => { state.autoPrint = e.target.checked; });
    $("onlyNew").addEventListener("change", e => { state.onlyNew = e.target.checked; render(); });
    $("showArch").addEventListener("change", e => { state.showArch = e.target.checked; render(); });
    $("csvBtn").addEventListener("click", downloadCsv);
    $("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem(SESSION);
      location.reload();
    });

    $("newOrderBtn").addEventListener("click", () => {
      resetNewOrder();
      $("newOrderModal").classList.remove("hidden");
    });
    $("closeNewBtn").addEventListener("click", closeNewOrder);
    $("saveOrderBtn").addEventListener("click", saveNewOrder);
    $("noClear").addEventListener("click", () => { newOrder.cart = []; renderCart(); });
    $("noSearch").addEventListener("input", renderGrid);
    $("segType").addEventListener("click", e => {
      const b = e.target.closest(".seg-btn");
      if (!b) return;
      setSegType(b.dataset.t);
    });
    $("noTabs").addEventListener("click", e => {
      const b = e.target.closest(".tab");
      if (!b) return;
      state.pCat = parseInt(b.dataset.i, 10);
      renderTabs();
      renderGrid();
    });
    $("noGrid").addEventListener("click", e => {
      const b = e.target.closest(".p-btn");
      if (!b) return;
      const ci = parseInt(b.dataset.ci, 10);
      const ii = parseInt(b.dataset.ii, 10);
      const it = catItems(ci)[ii];
      if ((it.variants || []).length) openVariants(ci, ii);
      else addToCart(ci, ii, null);
    });
    $("noVariantList").addEventListener("click", e => {
      const b = e.target.closest(".v-btn");
      if (!b) return;
      const ci = parseInt($("noVariant").dataset.ci, 10);
      const ii = parseInt($("noVariant").dataset.ii, 10);
      const it = catItems(ci)[ii];
      const v = (it.variants || [])[parseInt(b.dataset.v, 10)];
      addToCart(ci, ii, v);
      $("noVariant").classList.add("hidden");
    });
    $("noItems").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      const ix = parseInt(b.dataset.ix, 10);
      const c = newOrder.cart[ix];
      if (!c) return;
      if (b.dataset.del) {
        newOrder.cart.splice(ix, 1);
      } else if (b.dataset.d === "-1") {
        c.qty -= 1;
        if (c.qty <= 0) newOrder.cart.splice(ix, 1);
      } else {
        c.qty += 1;
      }
      renderCart();
    });

    $("loginBtn").addEventListener("click", doLogin);
    $("loginPass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
    $("loginUser").addEventListener("keydown", e => { if (e.key === "Enter") $("loginPass").focus(); });

    /* ---------- Productos ---------- */
    $("productsBtn").addEventListener("click", () => { $("productsModal").classList.remove("hidden"); fetchProducts(); });
    $("closeProductsBtn").addEventListener("click", () => $("productsModal").classList.add("hidden"));
    $("addProductBtn").addEventListener("click", addProduct);
    $("pmSearch").addEventListener("input", () => renderProducts(window._prodCache || []));

    function fetchProducts() {
      fetch(API.replace("/orders", "/menu_items") + "?marca=eq." + encodeURIComponent(BRAND.marca || "") + "&select=*&order=categoria,orden", { headers: HEADERS })
        .then(r => r.json()).then(rows => {
          window._prodCache = rows;
          renderProducts(rows);
        }).catch(() => toast("Error al cargar productos"));
    }

    function renderProducts(rows) {
      const q = ($("pmSearch").value || "").toLowerCase();
      const filtered = q ? rows.filter(r => r.nombre.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q)) : rows;
      let lastCat = "";
      $("productsList").innerHTML = filtered.map(p => {
        const catLine = p.categoria !== lastCat ? '<div style="font-weight:800;margin:10px 0 4px;color:var(--primary)">' + esc(p.categoria) + '</div>' : '';
        lastCat = p.categoria;
        return catLine + '<div class="user-row"><span><span class="u-name">' + esc(p.nombre) + '</span> $' + p.precio + (!p.disponible ? ' <span style="color:#c62828">AGOTADO</span>' : '') + '</span>' +
          '<span class="u-btns"><button class="btn-sm" data-pid="' + p.id + '" data-act="edit">✏️</button>' +
          '<button class="btn-sm danger" data-pid="' + p.id + '" data-act="toggle" data-val="' + !p.disponible + '">' + (p.disponible ? 'Desactivar' : 'Activar') + '</button></span></div>';
      }).join("");
      document.querySelectorAll("#productsList .btn-sm").forEach(b => {
        b.addEventListener("click", () => {
          const pid = b.dataset.pid;
          if (b.dataset.act === "toggle") {
            fetch(API.replace("/orders", "/menu_items") + "?id=eq." + pid, {
              method: "PATCH", headers: Object.assign({ "Content-Type": "application/json", "Prefer": "return=minimal" }, HEADERS),
              body: JSON.stringify({ disponible: b.dataset.val === "true" })
            }).then(() => fetchProducts()).catch(() => toast("Error"));
          } else if (b.dataset.act === "edit") {
            const p = rows.find(r => r.id === pid);
            if (!p) return;
            $("pmCat").value = p.categoria;
            $("pmName").value = p.nombre;
            $("pmPrice").value = p.precio;
            $("pmDesc").value = p.descripcion || "";
            $("addProductBtn").textContent = "💾 Guardar cambios";
            $("addProductBtn").dataset.editId = pid;
          }
        });
      });
    }

    function addProduct() {
      const cat = $("pmCat").value.trim();
      const name = $("pmName").value.trim();
      const price = parseInt($("pmPrice").value, 10);
      const desc = $("pmDesc").value.trim();
      if (!cat || !name || isNaN(price)) { toast("Completa categoría, nombre y precio"); return; }
      const editId = $("addProductBtn").dataset.editId;
      const body = JSON.stringify({ categoria: cat, nombre: name, precio: price, descripcion: desc, marca: (BRAND.marca || "") });
      const method = editId ? "PATCH" : "POST";
      const url = editId ? (API.replace("/orders", "/menu_items") + "?id=eq." + editId) : API.replace("/orders", "/menu_items");
      fetch(url, { method, headers: Object.assign({ "Content-Type": "application/json", "Prefer": "return=minimal" }, HEADERS), body })
        .then(() => { toast(editId ? "Producto actualizado" : "Producto creado"); $("pmCat").value = ""; $("pmName").value = ""; $("pmPrice").value = ""; $("pmDesc").value = ""; $("addProductBtn").textContent = "➕ Agregar producto"; delete $("addProductBtn").dataset.editId; fetchProducts(); })
        .catch(() => toast("Error al guardar"));
    }
  }

  async function doLogin() {
    const u = $("loginUser").value.trim();
    const p = $("loginPass").value;
    if (!u || !p) return;
    try {
      const hash = await sha256(p);
      const r = await fetch(API.replace("/orders", "/usuarios") + "?username=eq." + encodeURIComponent(u) + "&select=*&limit=1", {
        headers: HEADERS
      });
      const rows = await r.json();
      const user = rows[0];
      if (!user || user.password_hash !== hash || !user.activo) throw new Error("invalid");
      const sess = { username: user.username, nombre: user.nombre, rol: user.rol };
      sessionStorage.setItem(SESSION, JSON.stringify(sess));
      showApp(sess);
    } catch (e) {
      $("loginErr").classList.remove("hidden");
      $("loginPass").value = "";
    }
  }

  function showApp(user) {
    $("pinScreen").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("hdUserName").textContent = user.nombre;
    $("hdUserRol").textContent = user.rol;
    if (user.rol === "admin") { $("usersBtn").style.display = ""; $("productsBtn").style.display = ""; }
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    refresh();
    start();
  }

  function init() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      $("pinScreen").classList.add("hidden");
      $("orders").innerHTML = '<div class="empty">Falta la configuración de Supabase.</div>';
      return;
    }
    const raw = sessionStorage.getItem(SESSION);
    try {
      const user = JSON.parse(raw);
      if (user && user.username) return showApp(user);
    } catch (e) {}
    wire();
  }

  init();
})();

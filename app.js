const fmt = n => "$" + n.toLocaleString("es-MX");

const GRADS = [
  ["#ff7ab8", "#e8367c"],
  ["#e8367c", "#9e1c52"],
  ["#ffc23d", "#d4a017"],
  ["#ff5e9c", "#c21f5e"],
  ["#4a2b3a", "#1c0d14"],
  ["#e8b13c", "#b4751e"],
  ["#c85a9a", "#7e2a63"],
  ["#ff90c0", "#d8447e"]
];
function gradFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const g = GRADS[h % GRADS.length];
  return "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")";
}

let cart = JSON.parse(localStorage.getItem("sakuraCart") || "[]");
let activeCat = "Todos";
let selectedVariant = null;
let pendingProduct = null;
let orderType = "llevar";
let payment = "Efectivo";
let palitos = "Si";
let pkgSelected = [];
let pendingPkg = null;

let cycle = parseInt(localStorage.getItem("sakuraCycle") || "0", 10);
const oldVisits = parseInt(localStorage.getItem("sakuraVisits") || "0", 10);
if (oldVisits > 0 && !localStorage.getItem("sakuraCycle")) {
  cycle = oldVisits % 8;
  localStorage.setItem("sakuraCycle", String(cycle));
  localStorage.removeItem("sakuraVisits");
}
localStorage.removeItem("sakuraTotal");

const $ = id => document.getElementById(id);

function sanitizeCart() {
  try {
    cart = (cart || []).filter(e => {
      if (!e || typeof e.key !== "string") return false;
      const clean = e.key.indexOf("pkg:") === 0 ? e.key.slice(4) : e.key;
      const p = clean.split(":");
      const cat = +p[0], item = +p[1];
      return MENU[cat] && MENU[cat].items[item];
    });
  } catch {
    cart = [];
  }
}
sanitizeCart();

function productKey(catIdx, itemIdx, variant) {
  return catIdx + ":" + itemIdx + (variant ? ":" + variant.label : "");
}

function findItem(key) {
  const clean = key.indexOf("pkg:") === 0 ? key.slice(4) : key;
  const p = clean.split(":");
  const cat = +p[0], item = +p[1];
  return {
    cat,
    item,
    variant: p[2] ? (MENU[cat].items[item].variants || []).find(v => v.label === p[2]) || null : null
  };
}

function getPrice(item, variant) {
  return variant ? variant.price : item.price;
}

function cartItemName(item, variant) {
  return item.name + (variant ? " · " + variant.label : "");
}

function save() { localStorage.setItem("sakuraCart", JSON.stringify(cart)); }
function cartCount() { return cart.reduce((a, c) => a + c.qty, 0); }
function cartTotal() { return cart.reduce((a, c) => a + c.price * c.qty, 0); }

function qtyOf(key) {
  const e = cart.find(c => c.key === key);
  return e ? e.qty : 0;
}

function iconTile(name, emoji) {
  const d = document.createElement("div");
  d.className = "item-icon";
  d.style.background = gradFor(name);
  d.textContent = emoji || name.charAt(0);
  return d;
}

/* ---------- Categorías ---------- */
function renderChips() {
  const nav = $("cats");
  nav.innerHTML = "";
  const cats = ["Todos", "⭐ Lo más pedido"].concat(MENU.map(c => c.name));
  cats.forEach(c => {
    const b = document.createElement("button");
    b.className = "chip" + (c === activeCat ? " active" : "");
    b.textContent = c;
    b.onclick = () => { activeCat = c; renderChips(); renderMenu(); window.scrollTo(0, 0); };
    nav.appendChild(b);
  });
}

/* ---------- Tarjeta de fidelidad ---------- */
function loyaltyStatus() {
  if (cycle === 7) return "🎉 ¡Tu próxima visita (#8) tiene 10% OFF!";
  const faltan10 = cycle === 0 ? 8 : 8 - cycle;
  return "Te faltan " + faltan10 + " visitas para tu 10% OFF.";
}
function renderLoyalty() {
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
function refreshLoyalty() {
  const st = $("lcStatus");
  const cnt = $("lcVisits");
  if (!st) return;
  st.textContent = loyaltyStatus();
  cnt.textContent = "#" + cycle;
  document.querySelectorAll("#lcDots .lc-dot").forEach(d => {
    const n = +d.dataset.n;
    d.classList.toggle("filled", n <= cycle);
  });
}
function loyaltyLine() {
  const v = cycle + 1;
  let s = "*Tarjeta de fidelidad:* Visita #" + v;
  if (v === 8) s += "\n🎉 *10% OFF en esta visita* (la tarjeta se reinicia)";
  else s += "\nTe faltan " + (8 - cycle) + " para tu 10% OFF";
  return s;
}

/* ---------- Menú ---------- */
function renderMenu() {
  const main = $("menu");
  main.innerHTML = "";
  main.appendChild(renderLoyalty());
  if (activeCat === "Todos" || activeCat === "⭐ Lo más pedido") {
    const h = document.createElement("div");
    h.className = "cat-title";
    h.textContent = "⭐ Lo más pedido";
    main.appendChild(h);
    const list = document.createElement("div");
    list.className = "featured-scroll";
    MENU.forEach((cat, ci) => cat.items.forEach((item, ii) => {
      if (item.featured) list.appendChild(featuredCard(ci, ii, item));
    }));
    main.appendChild(list);
  }
  MENU.forEach((cat, ci) => {
    if (activeCat !== "Todos" && activeCat !== cat.name) return;
    const h = document.createElement("div");
    h.className = "cat-title";
    h.textContent = cat.name;
    main.appendChild(h);
    const list = document.createElement("div");
    list.className = "items";
    cat.items.forEach((item, ii) => {
      list.appendChild(itemCard(ci, ii, item));
    });
    main.appendChild(list);
  });
  refreshLoyalty();
}

function featuredCard(ci, ii, item) {
  const div = document.createElement("div");
  div.className = "featured";
  div.style.background = gradFor(item.name);
  const key = productKey(ci, ii, null);
  const qty = qtyOf(key);

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
  p.textContent = fmt(item.price);
  div.appendChild(p);

  const area = document.createElement("div");
  area.className = "f-add";
  div.appendChild(area);
  renderAddButton(area, ci, ii, item, key, qty);
  return div;
}

function itemCard(ci, ii, item) {
  const div = document.createElement("div");
  div.className = "item";
  const key = productKey(ci, ii, null);
  const qty = qtyOf(key);

  div.appendChild(iconTile(item.name, item.emoji));

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
  pr.textContent = fmt(item.price);
  info.appendChild(pr);
  div.appendChild(info);

  const area = document.createElement("div");
  area.className = "add-area";
  div.appendChild(area);
  if (item.package) {
    renderPkgButton(area, ci, ii, item);
  } else {
    renderAddButton(area, ci, ii, item, key, qty);
  }
  return div;
}

/* ---------- Paquete 2 Rollos x $150 ---------- */
function pkgEntries(ci, ii) {
  return cart.filter(e => e.key.indexOf("pkg:" + ci + ":" + ii + ":") === 0);
}
function qtyOfPkg(ci, ii) {
  return pkgEntries(ci, ii).reduce((a, e) => a + e.qty, 0);
}
function renderPkgButton(area, ci, ii, item) {
  area.innerHTML = "";
  const qty = qtyOfPkg(ci, ii);
  if (qty > 0) {
    const st = document.createElement("div");
    st.className = "stepper";
    const m = document.createElement("button");
    m.textContent = "−";
    m.onclick = () => removeOnePkg(ci, ii);
    const s = document.createElement("span");
    s.textContent = qty;
    const p = document.createElement("button");
    p.textContent = "+";
    p.onclick = () => openPackageSheet(ci, ii, item);
    st.appendChild(m); st.appendChild(s); st.appendChild(p);
    area.appendChild(st);
  } else {
    const b = document.createElement("button");
    b.className = "add-btn variant";
    b.textContent = "Elegir 2";
    b.onclick = () => openPackageSheet(ci, ii, item);
    area.appendChild(b);
  }
}
function removeOnePkg(ci, ii) {
  const entries = pkgEntries(ci, ii);
  if (!entries.length) return;
  const last = entries[entries.length - 1];
  last.qty -= 1;
  if (last.qty <= 0) cart = cart.filter(e => e.key !== last.key);
  save();
  refreshAll();
}
function openPackageSheet(ci, ii, item) {
  pendingPkg = { ci, ii, item };
  pkgSelected = [];
  $("pkgTitle").textContent = item.name;
  $("pkgDesc").textContent = "Elige 2 rollos (puedes repetir el mismo):";
  const box = $("pkgOptions");
  box.innerHTML = "";
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
    leg.textContent = "2 x $150";
    opt.appendChild(check); opt.appendChild(label); opt.appendChild(leg);
    opt.onclick = () => {
      const count = pkgSelected.filter(r => r === roll).length;
      if (count >= 2) {
        pkgSelected.splice(pkgSelected.lastIndexOf(roll), 1);
      } else if (pkgSelected.length >= 2) {
        alert("Solo puedes elegir 2 rollos.");
        return;
      } else {
        pkgSelected.push(roll);
      }
      updatePkgUI();
    };
    box.appendChild(opt);
  });
  updatePkgUI();
  const sheet = $("pkgSheet");
  sheet.classList.remove("hidden");
  requestAnimationFrame(() => sheet.classList.add("show"));
}
function updatePkgUI() {
  document.querySelectorAll("#pkgOptions .pkg-opt").forEach(opt => {
    const roll = opt.dataset.roll;
    const count = pkgSelected.filter(r => r === roll).length;
    const check = opt.querySelector(".pkg-check");
    check.textContent = count > 0 ? "●" : "○";
  const lbl = opt.querySelector(".pkg-label");
  lbl.textContent = count > 1 ? roll + " ×2" : roll;
  opt.classList.toggle("active", count > 0);
});
  $("pkgCount").textContent = "Seleccionados: " + (pkgSelected.join(" + ") || "ninguno");
  const btn = $("pkgAdd");
  btn.disabled = pkgSelected.length !== 2;
  btn.textContent = pkgSelected.length === 2 ? "Agregar " + fmt(150) : "Agregar (" + pkgSelected.length + "/2)";
}
function confirmPackage() {
  if (!pendingPkg || pkgSelected.length !== 2) return;
  const { ci, ii, item } = pendingPkg;
  const sorted = pkgSelected.slice().sort();
  const key = "pkg:" + ci + ":" + ii + ":" + sorted.join("+");
  const entry = cart.find(e => e.key === key);
  if (entry) {
    entry.qty += 1;
  } else {
    cart.push({
      key,
      name: item.name + " · " + sorted[0] + " + " + sorted[1],
      price: item.price,
      qty: 1
    });
  }
  save();
  closePkgSheet();
  refreshAll();
}
function closePkgSheet() {
  const sheet = $("pkgSheet");
  sheet.classList.remove("show");
  setTimeout(() => sheet.classList.add("hidden"), 280);
}

function renderAddButton(area, ci, ii, item, key, qty) {
  area.innerHTML = "";
  if (qty > 0) {
    const st = document.createElement("div");
    st.className = "stepper";
    const m = document.createElement("button");
    m.textContent = "−";
    m.onclick = e => { e.stopPropagation(); changeQty(key, -1); };
    const s = document.createElement("span");
    s.textContent = qty;
    const p = document.createElement("button");
    p.textContent = "+";
    p.onclick = e => { e.stopPropagation(); changeQty(key, 1); };
    st.appendChild(m); st.appendChild(s); st.appendChild(p);
    area.appendChild(st);
  } else {
    const b = document.createElement("button");
    b.className = item.variants ? "add-btn variant" : "add-btn";
    b.textContent = item.variants ? "Elegir" : "+";
    b.onclick = e => {
      e.stopPropagation();
      if (item.variants) {
        pendingProduct = { ci, ii, item };
        openVariantSheet(item);
      } else {
        changeQty(key, 1);
      }
    };
    area.appendChild(b);
  }
}

function changeQty(key, delta) {
  const info = findItem(key);
  const item = MENU[info.cat].items[info.item];
  const entry = cart.find(c => c.key === key);
  if (!entry) {
    cart.push({ key, name: cartItemName(item, info.variant), price: getPrice(item, info.variant), qty: delta });
  } else {
    entry.qty += delta;
    if (entry.qty <= 0) cart = cart.filter(c => c.key !== key);
  }
  save();
  refreshAll();
}

/* ---------- Variantes ---------- */
function openVariantSheet(item) {
  selectedVariant = null;
  $("sheetName").textContent = item.name;
  $("sheetDesc").textContent = item.desc || "";
  const box = $("sheetOptions");
  box.innerHTML = "";
  item.variants.forEach(v => {
    const opt = document.createElement("div");
    opt.className = "variant-opt";
    const s1 = document.createElement("span");
    s1.textContent = v.label;
    const s2 = document.createElement("span");
    s2.textContent = fmt(v.price);
    opt.appendChild(s1); opt.appendChild(s2);
    opt.onclick = () => {
      selectedVariant = v;
      document.querySelectorAll(".variant-opt").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
    };
    box.appendChild(opt);
  });
  const sheet = $("sheet");
  sheet.classList.remove("hidden");
  requestAnimationFrame(() => sheet.classList.add("show"));
}

function confirmVariant() {
  if (!selectedVariant || !pendingProduct) return;
  const { ci, ii, item } = pendingProduct;
  changeQty(productKey(ci, ii, selectedVariant), 1);
  closeSheet();
}

function closeSheet() {
  const sheet = $("sheet");
  sheet.classList.remove("show");
  setTimeout(() => sheet.classList.add("hidden"), 280);
}

/* ---------- Carrito ---------- */
function renderDrawer() {
  const body = $("drawerBody");
  const total = $("drawerTotal");
  const foot = $("drawerFoot");
  const clearBtn = $("clearBtn");
  body.innerHTML = "";

  if (!cart.length) {
    body.innerHTML = '<div class="empty-cart"><div class="big">🛒</div>Tu pedido está vacío.<br>Agrega algo del menú.</div>';
    total.textContent = "$0";
    foot.classList.add("hidden");
    clearBtn.classList.add("hidden");
    return;
  }

  foot.classList.remove("hidden");
  clearBtn.classList.remove("hidden");

  cart.forEach(c => {
    const line = document.createElement("div");
    line.className = "cart-line";

    const icon = iconTile(c.name);
    icon.classList.add("mini");
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
    sub.textContent = fmt(c.price * c.qty);
    top.appendChild(n); top.appendChild(sub);

    const bottom = document.createElement("div");
    bottom.className = "cl-bottom";
    const pr = document.createElement("div");
    pr.className = "cl-price";
    pr.textContent = fmt(c.price) + " c/u";
    bottom.appendChild(pr);

    const controls = document.createElement("div");
    controls.className = "cl-controls";

    const st = document.createElement("div");
    st.className = "stepper";
    const m = document.createElement("button");
    m.type = "button";
    m.textContent = "−";
    m.setAttribute("aria-label", "Quitar uno");
    m.onclick = () => changeQty(c.key, -1);
    const s = document.createElement("span");
    s.textContent = c.qty;
    const p = document.createElement("button");
    p.type = "button";
    p.textContent = "+";
    p.setAttribute("aria-label", "Agregar uno");
    p.onclick = () => changeQty(c.key, 1);
    st.appendChild(m); st.appendChild(s); st.appendChild(p);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "cl-remove";
    del.textContent = "🗑";
    del.setAttribute("aria-label", "Quitar platillo");
    del.title = "Quitar platillo";
    del.onclick = () => { cart = cart.filter(x => x.key !== c.key); save(); refreshAll(); };

    controls.appendChild(st); controls.appendChild(del);
    bottom.appendChild(controls);
    main.appendChild(top); main.appendChild(bottom);

    line.appendChild(main);
    body.appendChild(line);
  });

  total.textContent = fmt(cartTotal());
}

function clearCart() {
  if (!cart.length) return;
  cart = [];
  save();
  refreshAll();
}

function openDrawer() { renderDrawer(); $("drawer").classList.add("show"); $("overlay").classList.add("show"); }
function closeDrawer() { $("drawer").classList.remove("show"); $("overlay").classList.remove("show"); }

/* ---------- Checkout ---------- */
function setType(t) {
  orderType = t;
  $("optLlevar").classList.toggle("active", t === "llevar");
  $("optDomicilio").classList.toggle("active", t === "domicilio");
  $("fieldAddress").classList.toggle("hidden", t !== "domicilio");
  $("deliveryNote").classList.toggle("hidden", t !== "domicilio");
}

function setPayment(p) {
  payment = p;
  $("optEfectivo").classList.toggle("active", p === "Efectivo");
  $("optTransferencia").classList.toggle("active", p === "Transferencia");
}

function setPalitos(v) {
  palitos = v;
  $("optPalitosSi").classList.toggle("active", v === "Si");
  $("optPalitosNo").classList.toggle("active", v === "No");
}

function goCheckout() {
  closeDrawer();
  if (!cart.length) return;
  $("menu").classList.add("hidden");
  $("cats").classList.add("hidden");
  $("checkout").classList.remove("hidden");
  $("floatCart").classList.add("hidden");
  window.scrollTo(0, 0);
  renderCheckout();
}

function goBack() {
  $("checkout").classList.add("hidden");
  $("menu").classList.remove("hidden");
  $("cats").classList.remove("hidden");
  refreshFloat();
  window.scrollTo(0, 0);
}

function editOrder() {
  goBack();
  setTimeout(openDrawer, 60);
}

function renderCheckout() {
  const box = $("checkoutItems");
  box.innerHTML = "";
  cart.forEach(c => {
    const line = document.createElement("div");
    line.className = "os-line";
    const l = document.createElement("span");
    l.textContent = c.qty + " x " + c.name;
    const r = document.createElement("span");
    r.textContent = fmt(c.price * c.qty);
    line.appendChild(l); line.appendChild(r);
    box.appendChild(line);
  });
  $("checkoutTotal").textContent = fmt(cartTotal());
}

function buildMessage(name, phone, address, notes, salsas) {
  const L = [];
  L.push("*" + CONFIG.business + "*");
  L.push("*NUEVO PEDIDO*");
  L.push("");
  L.push("*Nombre:* " + name);
  L.push("*Teléfono:* " + phone);
  L.push("*Tipo:* " + (orderType === "domicilio" ? "A domicilio" : "Para llevar"));
  if (orderType === "domicilio") {
    L.push("*Dirección:* " + address);
    L.push("*Envío:* costo extra según mi ubicación");
  }
  L.push("*Pago:* " + payment);
  L.push("");
  L.push("*PEDIDO*");
  cart.forEach(c => {
    L.push(c.qty + " x " + c.name + "  =  " + fmt(c.price * c.qty));
  });
  L.push("");
  L.push("*TOTAL: " + fmt(cartTotal()) + "*");
  L.push("");
  L.push(loyaltyLine());
  if (notes) {
    L.push("");
    L.push("*Cambios al platillo:*");
    L.push(notes);
  }
  L.push("");
  L.push("*Salsas:* " + (salsas || "Sin comentario"));
  L.push("*Palitos:* " + (palitos === "Si" ? "Sí" : "No"));
  if (orderType === "domicilio") {
    L.push("");
    L.push("📍 *Adjunto mi ubicación*");
  }
  return L.join("\n");
}

function sendWhatsApp() {
  const name = $("fName").value.trim();
  const phone = $("fPhone").value.trim();
  const calle = $("fCalle").value.trim();
  const numero = $("fNumero").value.trim();
  const cruzamiento = $("fCruzamiento").value.trim();
  const espec = $("fEspec").value.trim();
  const notes = $("fNotes").value.trim();
  const salsas = $("fSalsas").value.trim();

  if (!name) { alert("Escribe tu nombre."); return; }
  if (!phone) { alert("Escribe tu teléfono."); return; }
  if (orderType === "domicilio") {
    if (!calle) { alert("Escribe la calle de tu dirección."); return; }
    if (!numero) { alert("Escribe el número de tu casa."); return; }
    if (!cruzamiento) { alert("Escribe el cruzamiento de tu calle."); return; }
  }

  let address = "";
  if (orderType === "domicilio") {
    address = calle + " #" + numero + ", cruce con " + cruzamiento;
    if (espec) address += " (" + espec + ")";
  }

  const msg = buildMessage(name, phone, address, notes, salsas);
  const url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");

  cycle += 1;
  if (cycle >= 8) cycle = 0;
  localStorage.setItem("sakuraCycle", String(cycle));
  refreshLoyalty();
}

/* ---------- General ---------- */
function refreshAll() {
  renderMenu();
  renderDrawer();
  refreshFloat();
}

function refreshFloat() {
  const n = cartCount();
  const fc = $("floatCart");
  const badge = $("badge");
  if (n > 0) {
    fc.classList.remove("hidden");
    $("fcTotal").textContent = fmt(cartTotal());
    badge.classList.remove("hidden");
    badge.textContent = n;
  } else {
    fc.classList.add("hidden");
    badge.classList.add("hidden");
  }
}

renderChips();
renderMenu();
refreshFloat();

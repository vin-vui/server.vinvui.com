/**
 * configurator.js — Logique du configurateur d'offre.
 *
 * Architecture :
 *   • État global en mémoire + persistance localStorage
 *   • Rendu construit via DOM API (pas d'innerHTML)
 *   • Délégation d'événements (clic + clavier)
 *   • Récap dynamique avec annonce lecteur d'écran (aria-live)
 *   • Deux actions de soumission : mailto et copie presse-papier
 */

import { CONTACT_EMAIL, servers, maintenance, options } from "./data.js";

/* =============================================================
   CONSTANTES
   ============================================================= */

const STORAGE_KEY = "vinvui:offer";
const SUBJECT = "Demande de devis — Serveur & Maintenance";
const COPY_FEEDBACK_MS = 1800;

const SVG_NS = "http://www.w3.org/2000/svg";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const fmt = (n) => eurFormatter.format(n);

/* =============================================================
   ÉTAT
   ============================================================= */

const state = {
  server: null,
  maint: null,
  options: new Set(),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.server) state.server = saved.server;
    if (saved.maint) state.maint = saved.maint;
    if (Array.isArray(saved.options)) state.options = new Set(saved.options);
  } catch {
    /* localStorage indisponible ou JSON corrompu : on repart à zéro */
  }
}

function persistState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        server: state.server,
        maint: state.maint,
        options: [...state.options],
      }),
    );
  } catch {
    /* navigation privée stricte, quota dépassé… on continue silencieusement */
  }
}

/* =============================================================
   HELPERS DE CRÉATION DOM
   ============================================================= */

/**
 * Crée un élément HTML.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {...(Node|string|Array)} children
 */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

/**
 * Crée un élément SVG.
 */
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

function applyAttrs(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") {
      node.setAttribute("class", value);
    } else if (key === "dataset" && typeof value === "object") {
      Object.assign(node.dataset, value);
    } else {
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
}

function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/* =============================================================
   ICONES (SVG sans innerHTML)
   ============================================================= */

function makeCheckIcon() {
  return svg(
    "svg",
    {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "3.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    svg("polyline", { points: "20 6 9 17 4 12" }),
  );
}

/* =============================================================
   CARTES — construction
   ============================================================= */

function buildServerCard(s) {
  return el(
    "div",
    {
      class: `pick${s.featured ? " featured" : ""}`,
      role: "button",
      tabindex: "0",
      "aria-pressed": "false",
      "aria-label": `Sélectionner le serveur ${s.name}, ${fmt(s.price)} par an`,
      dataset: { group: "server", id: s.id },
    },
    s.featured ? el("span", { class: "badge" }, "Le plus choisi") : null,
    el("span", { class: "tick" }),
    el("div", { class: "srv-name" }, s.name),
    el("div", { class: "srv-desc" }, s.desc),
    el(
      "div",
      { class: "specs" },
      buildSpec(s.vcpu, "vCPU"),
      buildSpec(s.ram, "RAM"),
      buildSpec(s.ssd, "SSD"),
      buildSpec(s.tr, "transfert"),
    ),
    el(
      "div",
      { class: "srv-price" },
      el("b", {}, fmt(s.price)),
      el("span", {}, "/ an"),
    ),
  );
}

function buildSpec(value, label) {
  return el(
    "div",
    { class: "spec" },
    el("span", { class: "dot" }),
    el("b", {}, value),
    " " + label,
  );
}

function buildMaintCard(m) {
  return el(
    "div",
    {
      class: `mcard${m.featured ? " featured" : ""}`,
      role: "button",
      tabindex: "0",
      "aria-pressed": "false",
      "aria-label": `Sélectionner la maintenance ${m.name}, ${fmt(m.price)} par an`,
      dataset: { group: "maint", id: m.id },
    },
    m.featured ? el("span", { class: "badge" }, "Le plus choisi") : null,
    el("span", { class: "tick" }),
    el("div", { class: "medal" }, m.medal),
    el("div", { class: "m-name" }, m.name),
    el("div", { class: "m-price" }, fmt(m.price), el("span", {}, " / an")),
    el(
      "ul",
      { class: "m-feats" },
      ...m.feats.map((f) => el("li", {}, f)),
    ),
    el("div", { class: "m-ideal" }, m.ideal),
  );
}

function buildOptionCard(o) {
  return el(
    "div",
    {
      class: "opt",
      role: "button",
      tabindex: "0",
      "aria-pressed": "false",
      "aria-label": `Ajouter l'option ${o.name}, ${fmt(o.price)} par an`,
      dataset: { group: "option", id: o.id },
    },
    el("span", { class: "check" }, makeCheckIcon()),
    el(
      "div",
      { class: "o-top" },
      el("div", { class: "o-name" }, o.name),
      el(
        "div",
        { class: "o-price" },
        fmt(o.price),
        el("span", {}, " /an"),
      ),
    ),
    el("p", {}, o.desc),
    el(
      "div",
      { class: "o-tags" },
      ...o.tags.map((t) => el("span", {}, t)),
    ),
  );
}

/* =============================================================
   RENDU INITIAL DES CATALOGUES
   ============================================================= */

function renderCatalogs() {
  const $servers = document.getElementById("servers");
  const $maint = document.getElementById("maint");
  const $opts = document.getElementById("opts");

  clearChildren($servers);
  servers.forEach((s) => $servers.append(buildServerCard(s)));

  clearChildren($maint);
  maintenance.forEach((m) => $maint.append(buildMaintCard(m)));

  clearChildren($opts);
  options.forEach((o) => $opts.append(buildOptionCard(o)));
}

/* =============================================================
   SÉLECTION + AFFICHAGE
   ============================================================= */

function syncSelection() {
  document.querySelectorAll('[data-group="server"]').forEach((c) => {
    const on = c.dataset.id === state.server;
    c.classList.toggle("selected", on);
    c.setAttribute("aria-pressed", String(on));
  });
  document.querySelectorAll('[data-group="maint"]').forEach((c) => {
    const on = c.dataset.id === state.maint;
    c.classList.toggle("selected", on);
    c.setAttribute("aria-pressed", String(on));
  });
  document.querySelectorAll('[data-group="option"]').forEach((c) => {
    const on = state.options.has(c.dataset.id);
    c.classList.toggle("selected", on);
    c.setAttribute("aria-pressed", String(on));
  });
  persistState();
  renderRecap();
}

/* =============================================================
   RÉCAPITULATIF
   ============================================================= */

function renderRecap() {
  const sv = servers.find((s) => s.id === state.server);
  const mt = maintenance.find((m) => m.id === state.maint);
  const ops = options.filter((o) => state.options.has(o.id));
  const hasAny = Boolean(sv || mt || ops.length);
  const ready = Boolean(sv && mt);
  const total = (sv?.price ?? 0) + (mt?.price ?? 0) + ops.reduce((a, o) => a + o.price, 0);

  renderRecapLines(sv, mt, ops);
  renderTotal(total, hasAny);
  renderMonthly(total, ready);
  renderMobileBar(total, hasAny, ready);
  renderActionButtons(sv, mt, ops, total, ready);

  document.getElementById("reset-btn").style.display = hasAny ? "block" : "none";
}

function renderRecapLines(sv, mt, ops) {
  const $lines = document.getElementById("recap-lines");
  clearChildren($lines);

  $lines.append(sv ? makeLine("Serveur", sv.name, fmt(sv.price)) : makeEmptyLine("Serveur", "à choisir"));
  $lines.append(mt ? makeLine("Maintenance", mt.name, fmt(mt.price)) : makeEmptyLine("Maintenance", "à choisir"));

  if (ops.length) {
    ops.forEach((o) => $lines.append(makeLine("Option", o.name, fmt(o.price))));
  } else {
    $lines.append(makeEmptyLine("Options", "aucune"));
  }
}

function makeLine(category, label, price) {
  return el(
    "div",
    { class: "r-line" },
    el(
      "span",
      { class: "r-lab" },
      el("span", { class: "r-cat" }, category),
      " " + label,
    ),
    el("span", { class: "r-price" }, price),
  );
}

function makeEmptyLine(category, placeholder) {
  return el(
    "div",
    { class: "r-line" },
    el(
      "span",
      { class: "r-lab" },
      el("span", { class: "r-cat" }, category),
    ),
    el("span", { class: "r-empty" }, placeholder),
  );
}

function renderTotal(total, hasAny) {
  const $total = document.getElementById("total");
  clearChildren($total);
  if (hasAny) {
    $total.append(total.toLocaleString("fr-FR") + " ");
    $total.append(el("small", {}, "€/an"));
  } else {
    $total.append("—");
  }
}

function renderMonthly(total, ready) {
  document.getElementById("month").textContent = ready
    ? `soit ${fmt(Math.round(total / 12))} / mois`
    : "";
}

function renderMobileBar(total, hasAny, ready) {
  document.getElementById("mobi-total").textContent = hasAny ? fmt(total) : "—";
  document.getElementById("mobi-mo").textContent = ready
    ? "Total annuel"
    : "Sélectionnez votre offre";
}

function renderActionButtons(sv, mt, ops, total, ready) {
  const $quote = document.getElementById("quote-btn");
  const $copy = document.getElementById("copy-btn");

  if (ready) {
    const body = buildEmailBody(sv, mt, ops, total);
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`;

    $quote.removeAttribute("disabled");
    $quote.textContent = "Demander ce devis";
    $quote.dataset.mailto = mailto;

    $copy.removeAttribute("disabled");
    $copy.dataset.text = `À : ${CONTACT_EMAIL}\nSujet : ${SUBJECT}\n\n${body}`;
  } else {
    $quote.setAttribute("disabled", "");
    $quote.textContent = sv ? "Choisissez une maintenance" : "Choisissez un serveur";
    delete $quote.dataset.mailto;

    $copy.setAttribute("disabled", "");
    delete $copy.dataset.text;
  }

  // remise à zéro du feedback "Copié !" si la sélection change
  $copy.textContent = "Copier la demande";
  $copy.classList.remove("copied");
}

function buildEmailBody(sv, mt, ops, total) {
  const lines = [
    "Bonjour,",
    "",
    "Je souhaite un devis pour l'offre suivante :",
    "",
    `• Serveur : ${sv.name} (${sv.vcpu} vCPU, ${sv.ram} RAM, ${sv.ssd} SSD) — ${fmt(sv.price)}/an`,
    `• Maintenance : ${mt.name} — ${fmt(mt.price)}/an`,
    ...ops.map((o) => `• Option : ${o.name} — ${fmt(o.price)}/an`),
    "",
    `Total indicatif : ${fmt(total)}/an`,
    "",
    "Merci !",
  ];
  return lines.join("\n");
}

/* =============================================================
   ÉVÉNEMENTS
   ============================================================= */

function toggleSelection(card) {
  const group = card.dataset.group;
  const id = card.dataset.id;

  if (group === "server") {
    state.server = state.server === id ? null : id;
  } else if (group === "maint") {
    state.maint = state.maint === id ? null : id;
  } else if (group === "option") {
    if (state.options.has(id)) state.options.delete(id);
    else state.options.add(id);
  }
  syncSelection();
}

function onClick(event) {
  const card = event.target.closest("[data-group]");
  if (card) {
    toggleSelection(card);
  }
}

function onKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-group]");
  if (!card) return;
  event.preventDefault();
  card.click();
}

function onQuoteClick(event) {
  const url = event.currentTarget.dataset.mailto;
  if (url) window.location.href = url;
}

async function onCopyClick(event) {
  const btn = event.currentTarget;
  const text = btn.dataset.text;
  if (!text) return;

  const ok = await copyToClipboard(text);
  btn.textContent = ok ? "Copié !" : "Échec — copiez à la main";
  btn.classList.toggle("copied", ok);

  setTimeout(() => {
    btn.textContent = "Copier la demande";
    btn.classList.remove("copied");
  }, COPY_FEEDBACK_MS);
}

async function copyToClipboard(text) {
  // Voie moderne : Clipboard API (HTTPS uniquement)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* refusé ou indisponible : on tente le fallback */
    }
  }
  // Fallback : textarea hors écran + execCommand
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  Object.assign(ta.style, { position: "fixed", opacity: "0", pointerEvents: "none" });
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    /* navigateur très ancien : on retourne false */
  }
  document.body.removeChild(ta);
  return ok;
}

function onResetClick() {
  state.server = null;
  state.maint = null;
  state.options.clear();
  syncSelection();
}

/* =============================================================
   ANIMATIONS D'ENTRÉE
   ============================================================= */

function setupRiseObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll("[data-rise]").forEach((node) => observer.observe(node));
}

/* =============================================================
   INIT
   ============================================================= */

function init() {
  loadState();
  renderCatalogs();
  syncSelection();
  setupRiseObserver();

  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  document.getElementById("quote-btn").addEventListener("click", onQuoteClick);
  document.getElementById("copy-btn").addEventListener("click", onCopyClick);
  document.getElementById("reset-btn").addEventListener("click", onResetClick);

  document.getElementById("y").textContent = new Date().getFullYear();
}

init();

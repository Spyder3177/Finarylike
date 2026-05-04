const VERSION = "2.0.0 Premium Simple";

const state = {
  theme: localStorage.getItem("kfinance-theme") || "auto",
  accounts: [
    ["Compte courant", "Crédit Agricole", 3240],
    ["Livret A", "Épargne sécurité", 9600],
    ["LDDS", "Épargne travaux", 5000],
    ["Stock revente", "Matériel informatique", 2380],
    ["Dette restante", "Crédit / avance", -1370]
  ],
  categories: [
    ["Courses", 420, 520],
    ["Maison", 310, 450],
    ["Transport", 180, 240],
    ["Loisirs", 260, 300],
    ["Abonnements", 86, 120],
    ["Revente", 390, 650]
  ]
};

function euro(value){
  return new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(value);
}

function applyTheme(){
  const root = document.documentElement;
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.classList.toggle("light", state.theme === "light" || (state.theme === "auto" && prefersLight));
}
applyTheme();

document.getElementById("themeBtn").addEventListener("click", () => {
  state.theme = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto";
  localStorage.setItem("kfinance-theme", state.theme);
  applyTheme();
});

function switchScreen(name){
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
}
document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.tab)));
document.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => switchScreen(btn.dataset.open)));

function renderAccounts(){
  const list = document.getElementById("accountsList");
  list.innerHTML = state.accounts.map(([name, sub, amount]) => `
    <div class="asset-row">
      <div><b>${name}</b><small>${sub}</small></div>
      <strong class="${amount >= 0 ? "positive" : ""}">${euro(amount)}</strong>
    </div>
  `).join("");
  const net = state.accounts.reduce((sum, acc) => sum + acc[2], 0);
  document.getElementById("netWorth").textContent = euro(net);
}
renderAccounts();

document.getElementById("addDemo").addEventListener("click", () => {
  state.accounts.push(["Nouveau compte", "Compte ajouté en local", 500]);
  renderAccounts();
});

function renderCategories(){
  const wrap = document.getElementById("categories");
  wrap.innerHTML = state.categories.map(([name, spent, max]) => {
    const pct = Math.min(100, Math.round((spent / max) * 100));
    return `
      <div class="category">
        <div class="category-top">
          <b>${name}</b>
          <span>${euro(spent)} / ${euro(max)}</span>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>
    `;
  }).join("");
}
renderCategories();

function decodeFrenchCsv(text){
  // Normalize common mojibake from Crédit Agricole exports
  return text
    .replaceAll("Libell�", "Libellé")
    .replaceAll("D�bit", "Débit")
    .replaceAll("Cr�dit", "Crédit")
    .replaceAll("\r\n", "\n");
}

function parseCsvLine(line, sep){
  const out = [];
  let cur = "", quoted = false;
  for (let i = 0; i < line.length; i++){
    const c = line[i];
    if (c === '"') quoted = !quoted;
    else if (c === sep && !quoted){ out.push(cur.trim().replace(/^"|"$/g, "")); cur = ""; }
    else cur += c;
  }
  out.push(cur.trim().replace(/^"|"$/g, ""));
  return out;
}

document.getElementById("csvInput").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  let text = await file.text();
  text = decodeFrenchCsv(text);
  const lines = text.split("\n").filter(l => l.trim().length);
  const sep = (lines[0].match(/;/g)||[]).length >= (lines[0].match(/,/g)||[]).length ? ";" : ",";
  const headerIndex = lines.findIndex(l => /date/i.test(l) && (/libell/i.test(l) || /débit|debit|crédit|credit/i.test(l)));
  const header = parseCsvLine(lines[Math.max(0, headerIndex)], sep);
  const rows = lines.slice(Math.max(0, headerIndex + 1)).map(l => parseCsvLine(l, sep)).filter(r => r.length > 2);
  const idxDate = header.findIndex(h => /date/i.test(h));
  const idxLabel = header.findIndex(h => /libell/i.test(h));
  const idxDebit = header.findIndex(h => /débit|debit/i.test(h));
  const idxCredit = header.findIndex(h => /crédit|credit/i.test(h));
  const totalDebit = rows.reduce((s,r) => s + Math.abs(parseFloat((r[idxDebit]||"0").replace(",", ".")) || 0), 0);
  const totalCredit = rows.reduce((s,r) => s + Math.abs(parseFloat((r[idxCredit]||"0").replace(",", ".")) || 0), 0);

  document.getElementById("csvResult").textContent =
`Fichier : ${file.name}
Séparateur détecté : ${sep}
Ligne entête : ${headerIndex + 1}
Colonnes : ${header.join(" | ")}

Index date=${idxDate}, libellé=${idxLabel}, débit=${idxDebit}, crédit=${idxCredit}
Lignes importées : ${rows.length}
Total débits : ${euro(totalDebit)}
Total crédits : ${euro(totalCredit)}

Prochaine V3 possible : catégorisation automatique réelle + historique sauvegardé.`;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

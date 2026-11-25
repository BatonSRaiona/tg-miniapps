// Общие помощники Mini App: тема, вибро-отклик, подсказки, отправка заказа боту.
const tg = (window.Telegram && window.Telegram.WebApp) || null;

function initApp() {
  const scheme = tg && tg.colorScheme ? tg.colorScheme : "dark";
  document.documentElement.dataset.scheme = scheme;
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  tg.onEvent("themeChanged", () => { document.documentElement.dataset.scheme = tg.colorScheme; });
}

function tick() { if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged(); }

let toastTimer = null;
function toast(text) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// Telegram передаёт данные боту и сам закрывает окно.
// sendData работает только если окно открыто кнопкой под полем ввода (её присылает бот).
function sendToBot(obj) {
  const data = JSON.stringify(obj);
  const hint = "Откройте меню кнопкой внизу чата с ботом — тогда заказ уйдёт в чат";
  if (!tg || tg.platform === "unknown") { toast(hint); return false; }
  if (tg.initDataUnsafe && tg.initDataUnsafe.query_id) { toast(hint); return false; }   // открыто не той кнопкой
  try {
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    tg.sendData(data);
    setTimeout(() => toast(hint), 1500);   // окно не закрылось — значит, Telegram не принял данные
    return true;
  } catch (e) {
    toast(hint);
    return false;
  }
}

// Время в Алматы (UTC+5) независимо от часового пояса телефона.
function almatyNow() {
  const d = new Date(Date.now() + 5 * 3600e3);
  return { iso: d.toISOString().slice(0, 10), mins: d.getUTCHours() * 60 + d.getUTCMinutes(), date: d };
}
function addDays(iso, k) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + k);
  return d;
}
function rub(n) { return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₸"; }
const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MO = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

const START_DATE = "2026-11-20"; // Data-base inicial do Volume 1; ajuste se a publicação começar em outro dia.
const TOTAL_COMICS = 50;
const MAX_DAYS_AROUND_TODAY = 2;
const SITE_URL = "https://sites.google.com/view/grupo-deus-e-maior/p%C3%A1gina-inicial?authuser=0&pli=1";
const CACHE_NAME = "gibi-diario-volume-1-content-v2-free-choice";
const OFFER_EMAIL = "grupodeusemaior@gmail.com";

const $ = (id) => document.getElementById(id);
let manifest = {};
let todayIndex = 0;
let selectedIndex = 0;
let comicShown = false;

function dateAtLocalMidnight(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(start, end) {
  return Math.floor((dateAtLocalMidnight(end) - dateAtLocalMidnight(start)) / 86400000);
}
function getTodayComicIndex() {
  const days = daysBetween(START_DATE, new Date());
  return Math.max(0, Math.min(TOTAL_COMICS - 1, days));
}
function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"long", year:"numeric" }).format(date);
}
function imagePath(path) {
  return encodeURI(path).replaceAll("#","%23");
}
function updateNav() {
  const atPreviousLimit = selectedIndex <= Math.max(0, todayIndex - MAX_DAYS_AROUND_TODAY);
  const atNextLimit = selectedIndex >= Math.min(TOTAL_COMICS - 1, todayIndex + MAX_DAYS_AROUND_TODAY);
  // Os botões permanecem acionáveis no limite para apresentar a oferta, em vez de parecerem quebrados.
  $("previous").disabled = false;
  $("next").disabled = false;
  $("previous").textContent = atPreviousLimit ? "← Ver coleção completa" : "← Até 2 dias antes";
  $("next").textContent = atNextLimit ? "Coleção completa →" : "Até 2 dias depois →";
  $("today").textContent = selectedIndex === todayIndex
    ? (comicShown ? "✓ Quadrinho de hoje" : "Ver quadrinho de hoje")
    : "Voltar ao quadrinho de hoje";
}
function renderComic(showPages = comicShown) {
  comicShown = showPages;
  const number = selectedIndex + 1;
  $("comic-title").textContent = `Quadrinho ${String(number).padStart(2,"0")}`;
  $("comic-date").textContent = selectedIndex === todayIndex ? `Hoje • ${formatDate(new Date())}` : `Edição ${number} • ${selectedIndex < todayIndex ? "Anterior" : "Próxima"}`;
  $("comic-position").textContent = `Volume 1 • ${number} de ${TOTAL_COMICS}`;
  updateNav();

  const container = $("comic-pages");
  const endNote = $("end-note");
  container.replaceChildren();
  container.hidden = !comicShown;
  endNote.hidden = !comicShown;
  if (!comicShown) {
    updateNav();
    return;
  }
  const pages = manifest[String(number)] || [];
  if (!pages.length) {
    container.innerHTML = '<p class="page-loading">Não foram encontradas imagens nesta edição.</p>';
    return;
  }
  pages.forEach((path, index) => {
    const img = document.createElement("img");
    img.className = "comic-page";
    img.alt = `Quadrinho ${number}, página ${index + 1}`;
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";
    img.src = imagePath(path);
    img.addEventListener("error", () => {
      img.alt = `Não foi possível carregar ${path}`;
      img.style.minHeight = "80px";
    }, { once:true });
    container.appendChild(img);
  });
  window.scrollTo({top:0,behavior:"smooth"});
}
function setSelected(index, reveal = true) {
  const min = Math.max(0, todayIndex - MAX_DAYS_AROUND_TODAY);
  const max = Math.min(TOTAL_COMICS - 1, todayIndex + MAX_DAYS_AROUND_TODAY);
  selectedIndex = Math.max(min, Math.min(max, index));
  renderComic(reveal);
}
function showOffer() {
  const dialog = $("offer-dialog");
  if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  else window.location.href = `mailto:${OFFER_EMAIL}?subject=${encodeURIComponent("Gibi Diário completo em PDF")}`;
}
$("previous").addEventListener("click", () => {
  const min = Math.max(0, todayIndex - MAX_DAYS_AROUND_TODAY);
  if (selectedIndex <= min) showOffer();
  else setSelected(selectedIndex - 1);
});
$("next").addEventListener("click", () => {
  const max = Math.min(TOTAL_COMICS - 1, todayIndex + MAX_DAYS_AROUND_TODAY);
  if (selectedIndex >= max) showOffer();
  else setSelected(selectedIndex + 1);
});
$("close-offer").addEventListener("click", () => $("offer-dialog").close());
$("offer-dialog").addEventListener("click", (event) => {
  if (event.target === $("offer-dialog")) $("offer-dialog").close();
});
$("today").addEventListener("click", () => setSelected(todayIndex, true));
$("open-free").addEventListener("click", () => { setSelected(todayIndex, true); $("comic-pages").scrollIntoView({behavior:"smooth",block:"start"}); });

$("credits-button").addEventListener("click", () => $("credits-dialog").showModal());
$("close-credits").addEventListener("click", () => $("credits-dialog").close());
$("credits-dialog").addEventListener("click", (event) => {
  if (event.target === $("credits-dialog")) $("credits-dialog").close();
});

function updateConnection() {
  const online = navigator.onLine;
  $("connection-dot").className = `offline-dot ${online ? "online" : "offline"}`;
  $("offline-status").textContent = online ? "Conectado • páginas ficam salvas ao abrir" : "Modo offline";
}
window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

async function prepareOffline() {
  if (!("caches" in window) || !("serviceWorker" in navigator)) {
    $("offline-note").textContent = "Este navegador não oferece armazenamento offline compatível.";
    return;
  }
  const button = $("offline-download");
  const progressWrap = $("progress-wrap");
  const progress = $("download-progress");
  const label = $("progress-label");
  const paths = Object.values(manifest).flat();
  button.disabled = true;
  button.textContent = "Preparando…";
  progressWrap.hidden = false;
  progress.max = paths.length;
  let complete = 0;
  let failed = 0;
  const cache = await caches.open(CACHE_NAME);
  for (const path of paths) {
    try {
      const request = new Request(imagePath(path), {cache:"reload"});
      if (await cache.match(request)) { complete++; }
      else {
        const response = await fetch(request);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await cache.put(request, response.clone());
        complete++;
      }
    } catch (error) { failed++; }
    progress.value = complete + failed;
    label.textContent = `${complete + failed}/${paths.length}`;
    button.textContent = `Salvando páginas… ${Math.round((complete+failed)/paths.length*100)}%`;
  }
  button.disabled = false;
  button.textContent = failed ? "Tentar novamente (algumas páginas falharam)" : "Conteúdo preparado para offline ✓";
  $("offline-note").textContent = failed
    ? `${failed} arquivo(s) não puderam ser baixados. Verifique a conexão e tente novamente.`
    : `Pronto! ${complete} imagens guardadas no aparelho. Você pode ler as edições sem internet.`;
}
$("offline-download").addEventListener("click", prepareOffline);

async function start() {
  try {
    const response = await fetch("comics.json");
    if (!response.ok) throw new Error("Não foi possível ler o índice dos quadrinhos.");
    manifest = await response.json();
    todayIndex = getTodayComicIndex();
    // Ao abrir o app, começar na edição 1 na data-base, sem exibir as páginas automaticamente.
    selectedIndex = todayIndex;
    renderComic(false);
    updateConnection();
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("service-worker.js").catch(console.warn);
    }
  } catch (error) {
    $("comic-title").textContent = "Não foi possível abrir o app";
    $("comic-date").textContent = "No VS Code, use Live Server ou um servidor local. Não abra index.html diretamente.";
    $("comic-pages").innerHTML = `<p class="page-loading">${error.message}</p>`;
  }
}
start();

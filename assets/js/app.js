const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function closeMenu() {
  if (!menuButton || !mainNav) return;
  mainNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}

menuButton?.addEventListener('click', () => {
  if (!mainNav) return;
  const isOpen = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

mainNav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.addEventListener('click', (event) => {
  if (!mainNav?.classList.contains('open')) return;
  if (!mainNav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});

const SEARCH_INDEX = [
  { t: 'Коллекции', d: 'Все авторские серии Мастерской', u: 'worlds.html' },
  { t: 'Зимние легенды', d: 'Коллекция', u: 'world-winter.html' },
  { t: 'Тайны леса', d: 'Коллекция, мухоморы и лесные Жители', u: 'world-mushrooms.html' },
  { t: 'Древние существа', d: 'Коллекция драконов и мифических созданий', u: 'world-dragons.html' },
  { t: 'Русские сказки', d: 'Коллекция, вдохновлённая фольклором', u: 'world-russian.html' },
  { t: 'Белый Дракон', d: 'Житель · Древние существа', u: 'resident-white-dragon.html' },
  { t: 'Сирин', d: 'Житель · Русские сказки', u: 'resident-sirin.html' },
  { t: 'Щелкунчик Эрнст', d: 'Житель · Зимние легенды', u: 'resident-nutcracker.html' },
  { t: 'Крысиный Король', d: 'Житель · Зимние легенды', u: 'resident-rat-king.html' },
  { t: 'Карусельные Кони', d: 'Жители Мастерской', u: 'resident-carousel-horses.html' },
  { t: 'Рождение Жителей', d: 'Процесс создания от замысла до росписи', u: 'birth.html' },
  { t: 'Рождение Жителя', d: 'Интерактивный выбор основы, облика, глаз и истории', u: 'resident-birth.html' },
  { t: 'Хроники Мастерской', d: 'Истории создания и заметки', u: 'chronicles.html' },
  { t: 'Азимондиас, Зим', d: 'Первый синий дракон и первый Житель Мастерской', u: 'chronicle-azimondias.html' },
  { t: 'Мухоморное безумие', d: 'История первых ёлочных игрушек', u: 'chronicle-mushrooms.html' },
  { t: 'О Мастерской', d: 'О Вере и ручной работе', u: 'about.html' },
  { t: 'Свиток для путника', d: 'Ответы на вопросы о заказах и Жителях', u: 'guardian-path.html' },
  { t: 'Связаться с Мастерской', d: 'Задать вопрос или обсудить заказ', u: 'contacts.html' },
  { t: 'Доставка и упаковка', d: 'Как Житель отправляется к Хранителю', u: 'delivery.html' },
  { t: 'Уход за Жителем', d: 'Рекомендации по бережному уходу', u: 'care.html' }
];

const searchForm = document.querySelector('.site-search');
const searchInput = searchForm?.querySelector('input');
const searchResults = searchForm?.querySelector('.search-results');

function renderSearch(value) {
  if (!searchResults) return;
  const query = value.trim().toLocaleLowerCase('ru-RU');
  if (!query) {
    searchResults.hidden = true;
    searchResults.innerHTML = '';
    return;
  }

  const found = SEARCH_INDEX.filter((item) =>
    `${item.t} ${item.d}`.toLocaleLowerCase('ru-RU').includes(query)
  ).slice(0, 7);

  searchResults.innerHTML = found.length
    ? found.map((item) => `<a href="${item.u}"><b>${item.t}</b><small>${item.d}</small></a>`).join('')
    : '<div class="search-empty"><b>Ничего не найдено</b><small>Попробуйте другое слово</small></div>';
  searchResults.hidden = false;
}

searchInput?.addEventListener('input', (event) => renderSearch(event.target.value));
searchInput?.addEventListener('focus', () => renderSearch(searchInput.value));
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && searchResults) searchResults.hidden = true;
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const firstResult = searchResults?.querySelector('a');
  if (firstResult && searchInput?.value.trim()) window.location.assign(firstResult.href);
});

document.addEventListener('click', (event) => {
  if (searchForm && !searchForm.contains(event.target) && searchResults) searchResults.hidden = true;
});

// Resident links carry ?resident=... so the contact page can acknowledge the chosen work.
if (document.body && window.location.pathname.endsWith('contacts.html')) {
  const resident = new URLSearchParams(window.location.search).get('resident');
  const heading = document.querySelector('.contact-context-title');
  const text = document.querySelector('.contact-context-text');
  if (resident && heading && text) {
    heading.textContent = `Вас заинтересовал Житель «${resident}»`;
    const config = new URLSearchParams(window.location.search).get('config');
    text.textContent = config || 'При обращении укажите его имя — так Мастерской будет проще сразу понять, о какой работе идёт речь.';
  }
}

// v0.4.6: мягкая сказочная атмосфера, карта и переходы.
document.body?.classList.add('page-enter');

const fairyLayer = document.createElement('div');
fairyLayer.className = 'fairy-layer';
fairyLayer.setAttribute('aria-hidden', 'true');
for (let i = 0; i < 18; i += 1) {
  const fairy = document.createElement('i');
  fairy.className = 'fairy';
  fairy.style.left = `${Math.random() * 100}%`;
  fairy.style.top = `${Math.random() * 100}%`;
  fairy.style.setProperty('--dur', `${5 + Math.random() * 7}s`);
  fairy.style.setProperty('--drift', `${-30 + Math.random() * 60}px`);
  fairy.style.animationDelay = `${-Math.random() * 8}s`;
  fairyLayer.appendChild(fairy);
}
document.body?.appendChild(fairyLayer);

const storyToggle = document.createElement('button');
storyToggle.className = 'story-mode-toggle';
storyToggle.type = 'button';
storyToggle.setAttribute('aria-label', 'Включить режим сказки');
storyToggle.setAttribute('aria-pressed', 'false');
storyToggle.textContent = '✦';
document.body?.appendChild(storyToggle);

let audioContext;
let ambientTimer;
function playChime() {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * .12);
    gain.gain.linearRampToValueAtTime(.018, now + index * .12 + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .12 + 1.5);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * .12);
    oscillator.stop(now + index * .12 + 1.6);
  });
}
storyToggle.addEventListener('click', () => {
  const active = storyToggle.getAttribute('aria-pressed') !== 'true';
  storyToggle.setAttribute('aria-pressed', String(active));
  storyToggle.setAttribute('aria-label', active ? 'Выключить режим сказки' : 'Включить режим сказки');
  fairyLayer.style.opacity = active ? '1' : '.25';
  clearInterval(ambientTimer);
  if (active) {
    playChime();
    ambientTimer = setInterval(playChime, 18000);
  }
});

window.addEventListener('pointermove', (event) => {
  document.body.style.setProperty('--glow-x', `${event.clientX}px`);
  document.body.style.setProperty('--glow-y', `${event.clientY}px`);
}, { passive: true });

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.hash) return;
  event.preventDefault();
  document.body.classList.add('page-leave');
  window.setTimeout(() => window.location.assign(destination.href), 230);
});

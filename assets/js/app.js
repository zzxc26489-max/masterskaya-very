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
  { t: 'Хроники Мастерской', d: 'Истории создания и заметки', u: 'chronicles.html' },
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
    text.textContent = 'При обращении укажите его имя — так Мастерской будет проще сразу понять, о какой работе идёт речь.';
  }
}

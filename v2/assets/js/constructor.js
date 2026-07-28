(() => {
  const root = document.querySelector('[data-v2-constructor]');
  if (!root) return;

  const variants = {
    dragon: [
      {
        name: 'Северный страж',
        image: '../assets/images/constructor/dragon-light-4.webp',
        origin: 'северных скал и зимней тишины',
        character: 'спокойный, наблюдательный, преданный',
        story: 'светлый хранитель дороги, который не спешит говорить, но всегда остаётся рядом'
      },
      {
        name: 'Сердце огня',
        image: '../assets/images/constructor/dragon-light-3.webp',
        origin: 'земель у древнего вулкана',
        character: 'смелый, горячий, защищающий',
        story: 'дракон для тех, кому важны дом, решимость и тёплая внутренняя сила'
      },
      {
        name: 'Лесной дракон',
        image: '../assets/images/constructor/dragon-dark-4.webp',
        origin: 'древнего леса и мшистых троп',
        character: 'скрытный, внимательный, мудрый',
        story: 'существо, которое слышит шёпот корней и знает, где начинается тайная дорога'
      }
    ],
    horse: [
      {
        name: 'Белая герцогиня',
        image: '../assets/images/constructor/horse-4.webp',
        origin: 'зимнего дворца',
        character: 'изящная, внимательная, независимая',
        story: 'праздничная спутница для тихих желаний и долгих светлых дорог'
      },
      {
        name: 'Медный рыцарь',
        image: '../assets/images/constructor/horse-5.webp',
        origin: 'королевской конюшни',
        character: 'верный, прямой, бесстрашный',
        story: 'путник, который сопровождает Хранителя в самых важных переходах'
      },
      {
        name: 'Серебряная песня',
        image: '../assets/images/constructor/horse-7.webp',
        origin: 'лунной дороги',
        character: 'таинственная, спокойная, музыкальная',
        story: 'она слышит музыку, которую не слышит больше никто'
      }
    ]
  };

  const tones = {
    ice: { title: 'северного света', sentence: 'В нём есть ясность морозного утра и спокойная преданность.' },
    fire: { title: 'янтарного огня', sentence: 'В нём живёт тёплая искра, смелость и желание защищать.' },
    forest: { title: 'лесной тропы', sentence: 'Он чувствует настроение леса, корней и живых существ.' },
    mystic: { title: 'тайного знака', sentence: 'Он замечает то, что скрыто от обычного взгляда.' }
  };

  const state = { base: 'dragon', variant: 0, tone: 'ice', details: [], name: '' };
  if (new URLSearchParams(location.search).get('preset') === 'white-dragon') state.details = ['перламутровые акценты'];

  const variantRoot = document.getElementById('constructorVariants');
  const previewImage = document.getElementById('constructorPreviewImage');
  const previewName = document.getElementById('constructorPreviewName');
  const previewText = document.getElementById('constructorPreviewText');
  const nameInput = document.getElementById('constructorName');
  const summary = document.getElementById('constructorSummary');
  const contactLink = document.getElementById('constructorContact');

  function selectedVariant() { return variants[state.base][state.variant] || variants[state.base][0]; }

  function renderVariants() {
    variantRoot.innerHTML = variants[state.base].map((variant, index) => `
      <button class="variant-card" type="button" data-variant="${index}" aria-pressed="${index === state.variant}">
        <img src="${variant.image}" width="320" height="320" alt="${variant.name}" loading="lazy">
        <span>${variant.name}</span>
      </button>
    `).join('');
  }

  function syncButtons(group, value) {
    root.querySelectorAll(`[data-${group}]`).forEach((button) => {
      const isSelected = button.dataset[group] === value;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function updateDetails() {
    state.details = [...root.querySelectorAll('[data-detail]:checked')].map((input) => input.value);
    root.querySelectorAll('[data-detail]').forEach((input) => input.closest('.choice-button')?.classList.toggle('is-selected', input.checked));
  }

  function update() {
    updateDetails();
    const variant = selectedVariant();
    const tone = tones[state.tone];
    const customName = nameInput.value.trim();
    const name = customName || variant.name;
    const detailText = state.details.length ? state.details.join(', ') : 'особые детали пока не выбраны';

    previewImage.src = variant.image;
    previewImage.alt = `Предпросмотр: ${name}`;
    previewName.textContent = name;
    previewText.textContent = `${variant.character}. ${tone.sentence}`;

    const baseLabel = state.base === 'dragon' ? 'дракона' : 'коня';
    const result = `Я хочу создать Жителя в образе ${baseLabel}: ${variant.name.toLowerCase()} из ${variant.origin}, ${variant.character}, с настроением «${tone.title}». Детали: ${detailText}. Рабочее имя: ${name}. Понимаю, что это направление для индивидуальной работы, а не обещание буквальной копии.`;

    summary.textContent = result;
    contactLink.href = `../contacts.html?resident=${encodeURIComponent(name)}&config=${encodeURIComponent(result)}`;
  }

  root.querySelectorAll('[data-base]').forEach((button) => button.addEventListener('click', () => {
    state.base = button.dataset.base;
    state.variant = 0;
    syncButtons('base', state.base);
    renderVariants();
    update();
  }));

  root.querySelectorAll('[data-tone]').forEach((button) => button.addEventListener('click', () => {
    state.tone = button.dataset.tone;
    syncButtons('tone', state.tone);
    update();
  }));

  root.addEventListener('change', (event) => { if (event.target.matches('[data-detail]')) update(); });

  variantRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-variant]');
    if (!button) return;
    state.variant = Number(button.dataset.variant);
    renderVariants();
    update();
  });

  nameInput.addEventListener('input', update);

  document.getElementById('constructorRandom')?.addEventListener('click', () => {
    const pool = state.base === 'dragon'
      ? ['Фьорд', 'Эйра', 'Северин', 'Вельмир', 'Азар', 'Тихий Страж']
      : ['Аврора', 'Эстель', 'Лира', 'Фрейя', 'Медный Путник', 'Серебряная Песня'];
    nameInput.value = pool[Math.floor(Math.random() * pool.length)];
    update();
  });

  renderVariants();
  syncButtons('base', state.base);
  syncButtons('tone', state.tone);
  root.querySelectorAll('[data-detail]').forEach((input) => { input.checked = state.details.includes(input.value); });
  update();
})();

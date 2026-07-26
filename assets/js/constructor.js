(() => {
  const root = document.querySelector('[data-constructor]');
  if (!root) return;

  const variants = {
    dragon: [
      ['Золотой рассвет','assets/images/constructor/dragon-light-1.webp','солнечных утёсов','Величественный, щедрый и уверенный','Он собирает первые лучи рассвета и приносит Хранителю смелость начинать новое.'],
      ['Смоуг','assets/images/constructor/dragon-light-2.webp','древних сокровищниц','Гордый, проницательный и своенравный','Он знает цену каждому сокровищу, но больше всего ценит верность.'],
      ['Сердце огня','assets/images/constructor/dragon-light-3.webp','земель у древнего вулкана','Смелый, горячий и защищающий','Он появляется там, где нужно отстоять дом и согреть тех, кто рядом.'],
      ['Перламутровый страж','assets/images/constructor/dragon-light-4.webp','холодных скал','Спокойный, наблюдательный и преданный','Он хранит тишину зимних дорог и приходит к тем, кому нужен надёжный спутник.'],
      ['Пески Вестероса','assets/images/constructor/dragon-light-5.webp','песчаных королевств','Терпеливый, свободолюбивый и мудрый','Он умеет находить путь даже тогда, когда ветер стирает все следы.'],
      ['Солнечный ящер','assets/images/constructor/dragon-light-6.webp','тёплых островов','Весёлый, любопытный и общительный','Он хранит летнее настроение и никогда не проходит мимо приключения.'],
      ['Дракон света','assets/images/constructor/dragon-light-7.webp','небесных чертогов','Добрый, честный и самоотверженный','Он освещает дорогу Хранителю, когда вокруг становится особенно темно.'],
      ['Рубиновое сияние','assets/images/constructor/dragon-light-8.webp','горных дворцов','Страстный, благородный и решительный','Его рубиновая чешуя вспыхивает, когда рядом происходит несправедливость.'],
      ['Беззвёздная ночь','assets/images/constructor/dragon-dark-1.webp','ночных ущелий','Молчаливый, осторожный и верный','Он почти не показывает чувств, но никогда не оставляет своего Хранителя.'],
      ['Лесной дракон','assets/images/constructor/dragon-dark-4.webp','древнего леса','Спокойный, внимательный и скрытный','Он слышит шёпот корней и знает все тайные тропы.'],
      ['Космический странник','assets/images/constructor/dragon-dark-8.webp','далёких звёзд','Мечтательный, независимый и любознательный','Он приносит истории о мирах, которых ещё нет на картах.']
    ],
    horse: [
      ['Янтарная королева','assets/images/constructor/horse-1.webp','осеннего королевства','Гордая, заботливая и решительная','Она хранит тепло дворцовых залов и всегда помнит дорогу домой.'],
      ['Сливочный герцог','assets/images/constructor/horse-2.webp','тихой загородной усадьбы','Мягкий, благородный и терпеливый','Он любит неспешные путешествия и старые добрые истории.'],
      ['Пёстрый вестник','assets/images/constructor/horse-3.webp','ярмарочной площади','Озорной, смелый и общительный','Он первым узнаёт хорошие новости и приносит их своему Хранителю.'],
      ['Белая герцогиня','assets/images/constructor/horse-4.webp','зимнего дворца','Изящная, внимательная и независимая','Она появляется вместе с первым снегом и хранит праздничные желания.'],
      ['Медный рыцарь','assets/images/constructor/horse-5.webp','королевской конюшни','Верный, бесстрашный и прямой','Он сопровождает Хранителя в самых важных путешествиях.'],
      ['Карамельный паж','assets/images/constructor/horse-6.webp','сладкого города','Добрый, любопытный и немного застенчивый','Он собирает маленькие радости и делится ими с теми, кого любит.'],
      ['Серебряная песня','assets/images/constructor/horse-7.webp','лунной карусели','Таинственная, спокойная и музыкальная','Ночью она слышит музыку, которую не слышит больше никто.'],
      ['Золотой путник','assets/images/constructor/horse-8.webp','солнечной дороги','Открытый, упрямый и верный','Он не боится длинного пути, если знает, кто ждёт его в конце.'],
      ['Грозовой маршал','assets/images/constructor/horse-9.webp','каменной крепости','Сдержанный, сильный и надёжный','Он приходит перед грозой и защищает дом от тревог.']
    ]
  };

  const toneAdditions = {
    ice:['Ледяные','В его взгляде — ясность морозного утра.'],
    fire:['Янтарные','В его взгляде живёт тёплая искра.'],
    forest:['Изумрудные','Он чувствует настроение леса и живых существ.'],
    mystic:['Аметистовые','Он замечает то, что скрыто от обычного взгляда.'],
    night:['Ночные','Он особенно хорошо ориентируется в темноте.']
  };

  let base = 'dragon';
  let index = 3;
  let tone = 'ice';

  const grid = document.getElementById('variantGrid');
  const img = document.getElementById('residentPreview');
  const stage = document.querySelector('.preview-stage');
  const name = document.getElementById('residentName');
  const origin = document.getElementById('residentOrigin');
  const character = document.getElementById('residentCharacter');
  const story = document.getElementById('residentStory');
  const custom = document.getElementById('customName');

  function renderVariants() {
    grid.innerHTML = variants[base].map((v, i) => `
      <button class="variant ${i === index ? 'selected' : ''}" type="button" data-index="${i}" aria-pressed="${i === index}">
        <img src="${v[1]}" alt="${v[0]}" loading="lazy"/>
        <span>${v[0]}</span>
      </button>`).join('');
  }

  function update() {
    const v = variants[base][index];
    const eye = toneAdditions[tone];
    const details = [...root.querySelectorAll('[data-detail]:checked')].map(x => x.value);

    stage.classList.add('is-changing');
    window.setTimeout(() => {
      img.src = v[1];
      img.alt = v[0];
      stage.dataset.tonePreview = tone;
      stage.classList.remove('is-changing');
    }, 130);

    name.textContent = custom.value.trim() || v[0];
    origin.textContent = `Рождён среди ${v[2]}, где начинается его первая легенда.`;
    character.textContent = `${v[3]}. ${eye[1]}`;
    story.textContent = v[4] + (details.length ? ` Его особые дары: ${details.join(', ').toLocaleLowerCase('ru-RU')}.` : ' Остальные детали проявятся в руках Мастера.');
  }

  root.querySelectorAll('[data-base]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-base]').forEach(x => x.classList.remove('selected'));
    button.classList.add('selected');
    base = button.dataset.base;
    index = 0;
    renderVariants();
    update();
  }));

  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    index = Number(button.dataset.index);
    renderVariants();
    update();
  });

  root.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-tone]').forEach(x => x.classList.remove('selected'));
    button.classList.add('selected');
    tone = button.dataset.tone;
    update();
  }));

  root.querySelectorAll('[data-detail]').forEach(input => input.addEventListener('change', update));
  custom.addEventListener('input', update);

  document.getElementById('randomName').addEventListener('click', () => {
    const pool = base === 'dragon'
      ? ['Азар', 'Фьорд', 'Смарагд', 'Таргос', 'Вельмир', 'Эрвен']
      : ['Аврора', 'Лира', 'Марципан', 'Эстель', 'Фрейя', 'Веста'];
    custom.value = pool[Math.floor(Math.random() * pool.length)];
    update();
  });

  document.querySelectorAll('[data-step-target]').forEach(step => step.addEventListener('click', () => {
    document.getElementById(step.dataset.stepTarget)?.scrollIntoView({behavior:'smooth', block:'start'});
  }));

  const fields = [...root.querySelectorAll('fieldset[id]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.querySelectorAll('[data-step-target]').forEach(step => step.classList.toggle('active', step.dataset.stepTarget === visible.target.id));
    }, {rootMargin:'-28% 0px -55% 0px', threshold:[0,.25,.5]});
    fields.forEach(field => observer.observe(field));
  }

  document.getElementById('guardianButton').addEventListener('click', () => {
    const v = variants[base][index];
    const details = [...root.querySelectorAll('[data-detail]:checked')].map(x => x.value).join(', ') || 'без дополнительных украшений';
    const text = `Хочу продолжить легенду Жителя. Основа: ${base === 'dragon' ? 'дракон' : 'королевский конь'}. Воплощение: ${v[0]}. Глаза: ${toneAdditions[tone][0]}. Детали: ${details}. Имя: ${name.textContent}.`;
    location.href = `contacts.html?resident=${encodeURIComponent(name.textContent)}&config=${encodeURIComponent(text)}`;
  });

  renderVariants();
  update();
})();

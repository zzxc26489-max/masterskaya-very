(() => {
  const grid = document.querySelector('#residentGrid');
  const empty = document.querySelector('#residentEmpty');
  if (!grid || !Array.isArray(window.RESIDENTS)) return;
  const render = (filter = 'all') => {
    const residents = window.RESIDENTS.filter((resident) => filter === 'all' || resident.availabilityStatus === filter);
    grid.innerHTML = residents.map((resident) => `<article class="card" data-world-theme="${resident.worldTheme}"><img src="${resident.mainImage}" alt="${resident.name}" loading="lazy"><div class="card-body"><p class="eyebrow">${resident.collection}</p><h2>${resident.name}</h2><p>${resident.shortDescription}</p><span class="availability">${resident.availabilityLabel}</span><div><a class="ghost-btn" href="resident-${resident.slug}.html">Открыть Жителя</a> <a class="btn" href="resident-birth.html?preset=${resident.id}">Создать похожего Жителя</a></div></div></article>`).join('');
    empty.hidden = residents.length > 0;
  };
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => render(button.dataset.filter)));
  render();
})();

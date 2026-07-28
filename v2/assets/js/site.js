(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !navigation) return;
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    if (restoreFocus) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    if (!navigation) return;
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    if (isOpen) navigation.querySelector('a')?.focus();
  });

  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!navigation?.classList.contains('is-open')) return;
    if (!navigation.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation?.classList.contains('is-open')) closeMenu({ restoreFocus: true });
  });

  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach((element) => observer.observe(element));
  }

  const filterButtons = document.querySelectorAll('[data-resident-filter]');
  const residentCards = document.querySelectorAll('[data-resident-status]');
  const emptyState = document.querySelector('[data-resident-empty]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.residentFilter;
      filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      let visibleCount = 0;
      residentCards.forEach((card) => {
        const isVisible = filter === 'all' || card.dataset.residentStatus === filter;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  });
})();

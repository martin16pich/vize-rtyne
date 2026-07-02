(function () {
  const links = Array.from(document.querySelectorAll('.nav a, .dropdown-menu a'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActive() {
    let current = sections[0]?.id || 'uvod';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.35) current = section.id;
    }

    document.querySelectorAll('.nav a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
})();

(function () {
  const cityPoints = document.getElementById('cityPoints');
  if (!cityPoints) return;

  function renderCityPlaces(places) {
    cityPoints.innerHTML = '';

    places.forEach((place) => {
      const link = document.createElement('a');
      link.className = 'city-hotspot';
      link.href = `#${place.id}`;
      link.style.setProperty('--x', `${place.x}%`);
      link.style.setProperty('--y', `${place.y}%`);
      link.setAttribute('aria-label', place.title);

      const tooltip = document.createElement('span');
      tooltip.className = 'city-tooltip';
      tooltip.textContent = place.title;

      if (place.icon === 'arrow-right') {
        link.classList.add('arrow-right');
        link.dataset.icon = 'arrow-right';

        const arrow = document.createElement('span');
        arrow.className = 'city-arrow-symbol';
        arrow.textContent = '➜';
        link.appendChild(arrow);
      }

      link.appendChild(tooltip);
      cityPoints.appendChild(link);
    });
  }

  fetch('data/places.json')
    .then((response) => response.json())
    .then(renderCityPlaces)
    .catch(() => {
      cityPoints.innerHTML = '';
    });
})();


// Mobilní rozbalovací menu Místa
(function () {
  const dropdown = document.querySelector('.dropdown');
  const toggle = document.querySelector('.dropdown-toggle');
  const menu = document.querySelector('.dropdown-menu');
  if (!dropdown || !toggle || !menu) return;

  function closeMenu() {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    dropdown.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropdown.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();


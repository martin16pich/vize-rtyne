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

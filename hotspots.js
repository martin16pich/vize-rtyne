(function () {
  const container = document.getElementById('zabarna');
  const hotspotsEl = document.getElementById('hotspots');
  const card = document.getElementById('infoCard');
  const cardClose = document.getElementById('cardClose');
  const cardImage = document.getElementById('cardImage');
  const cardTitle = document.getElementById('cardTitle');
  const cardText = document.getElementById('cardText');
  const image = container?.querySelector('.compare-future');
  const slider = container?.querySelector('.compare-range');

  if (!container || !hotspotsEl || !card || !image || !slider) return;

  let activeButton = null;
  let comparePercent = Number(slider.value || 50);

  function getCoverRect() {
    const c = container.getBoundingClientRect();
    const naturalRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = c.width / c.height;

    let width, height, left, top;
    if (boxRatio > naturalRatio) {
      width = c.width;
      height = c.width / naturalRatio;
      left = 0;
      top = (c.height - height) / 2;
    } else {
      height = c.height;
      width = c.height * naturalRatio;
      top = 0;
      left = (c.width - width) / 2;
    }
    return { left, top, width, height };
  }

  function positionHotspots() {
    if (!image.naturalWidth) return;
    const rect = getCoverRect();
    container.querySelectorAll('.hotspot').forEach((button) => {
      const x = Number(button.dataset.x);
      const y = Number(button.dataset.y);
      button.style.left = `${rect.left + (x / 100) * rect.width}px`;
      button.style.top = `${rect.top + (y / 100) * rect.height}px`;
    });
    updateHotspotVisibility(comparePercent);
  }

  function updateHotspotVisibility(percent) {
    comparePercent = percent;
    const compareRect = container.getBoundingClientRect();
    const sliderX = compareRect.width * (percent / 100);
    const hasFutureVisible = percent < 96;

    hotspotsEl.classList.toggle('visible', hasFutureVisible);

    container.querySelectorAll('.hotspot').forEach((button) => {
      const buttonCenterX = button.offsetLeft;
      const isOnFutureSide = buttonCenterX > sliderX + 10;
      const isVisible = hasFutureVisible && isOnFutureSide;

      button.classList.toggle('future-visible', isVisible);

      if (!isVisible && activeButton === button) closeCard();
    });
  }

  function openCard(item, button) {
    if (!button.classList.contains('future-visible')) return;

    if (activeButton) activeButton.classList.remove('active');
    activeButton = button;
    button.classList.add('active');

    cardImage.src = item.image;
    cardImage.alt = item.title;
    cardTitle.textContent = item.title;
    cardText.textContent = item.text;
    card.hidden = false;

    const c = container.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    const cardWidth = Math.min(360, c.width - 32);
    const left = Math.max(16, Math.min(c.width - cardWidth - 16, b.left - c.left - cardWidth / 2));
    let top = b.top - c.top - 270;
    if (top < 110) top = b.top - c.top + 42;
    if (top + 340 > c.height) top = c.height - 350;

    card.style.left = `${left}px`;
    card.style.top = `${Math.max(96, top)}px`;
  }

  function closeCard() {
    card.hidden = true;
    if (activeButton) activeButton.classList.remove('active');
    activeButton = null;
  }

  function renderHotspots(items) {
    hotspotsEl.innerHTML = '';
    items.forEach((item) => {
      const button = document.createElement('button');
      button.className = 'hotspot';
      button.type = 'button';
      button.dataset.x = item.x;
      button.dataset.y = item.y;
      button.setAttribute('aria-label', item.title);

      const dot = document.createElement('span');
      dot.className = 'hotspot-dot';
      const tooltip = document.createElement('span');
      tooltip.className = 'hotspot-tooltip';
      tooltip.textContent = item.title;
      button.appendChild(dot);
      button.appendChild(tooltip);

      button.addEventListener('click', (event) => {
        event.stopPropagation();
        openCard(item, button);
      });

      hotspotsEl.appendChild(button);
    });
    positionHotspots();
  }

  fetch('data/hotspots.json')
    .then((response) => response.json())
    .then(renderHotspots)
    .catch(() => { hotspotsEl.innerHTML = ''; });

  document.addEventListener('compare:change', (event) => {
    if (event.detail.container !== container) return;
    updateHotspotVisibility(event.detail.percent);
  });

  if (image.complete) positionHotspots();
  image.addEventListener('load', positionHotspots);
  window.addEventListener('resize', positionHotspots);
  cardClose.addEventListener('click', closeCard);
  container.addEventListener('click', (event) => {
    if (!card.hidden && !card.contains(event.target)) closeCard();
  });
})();

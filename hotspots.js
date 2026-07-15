(function () {
  const sectionFiles = {
    zabarna: 'data/hotspots.json',
    kampelicka: 'data/kampelicka-hotspots.json',
    hornicka: 'data/hornicka-hotspots.json',
    namesti: 'data/namesti-hotspots.json',
    centrum: 'data/centrum-hotspots.json',
    odpady: 'data/odpady-hotspots.json'
  };

  Object.entries(sectionFiles).forEach(([sectionId, dataFile]) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    let hotspotsEl = container.querySelector('.hotspots');
    if (!hotspotsEl) {
      hotspotsEl = document.createElement('div');
      hotspotsEl.className = 'hotspots';
      hotspotsEl.dataset.hotspots = dataFile;
      hotspotsEl.setAttribute('aria-label', `Klikací body – ${container.getAttribute('aria-label') || sectionId}`);
      container.appendChild(hotspotsEl);
    }

    let card = container.querySelector('.info-card');
    if (!card) {
      card = document.createElement('article');
      card.className = 'info-card';
      card.hidden = true;
      card.innerHTML = '<button class="card-close" aria-label="Zavřít kartu">×</button><img src="" alt=""><div class="card-body"><h2></h2><p></p></div>';
      container.appendChild(card);
    }
  });

  const hotspotContainers = Array.from(document.querySelectorAll('.hotspots'));
  hotspotContainers.forEach((hotspotsEl) => {
    const container = hotspotsEl.closest('.compare');
    const card = container?.querySelector('.info-card');
    const image = container?.querySelector('.compare-future');
    const slider = container?.querySelector('.compare-range');
    if (!container || !card || !image || !slider) return;

    const cardClose = card.querySelector('.card-close');
    const cardImage = card.querySelector('img');
    const cardTitle = card.querySelector('.card-body h2');
    const cardText = card.querySelector('.card-body p');
    const dataFile = hotspotsEl.dataset.hotspots;
    let activeButton = null;
    let comparePercent = Number(slider.value || 50);

    function getCoverRect() {
      const c = container.getBoundingClientRect();
      const naturalRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = c.width / c.height;
      let width, height, left, top;
      if (boxRatio > naturalRatio) { width = c.width; height = c.width / naturalRatio; left = 0; top = (c.height - height) / 2; }
      else { height = c.height; width = c.height * naturalRatio; top = 0; left = (c.width - width) / 2; }
      return { left, top, width, height };
    }
    function positionHotspots() {
      if (!image.naturalWidth) return;
      const rect = getCoverRect();
      container.querySelectorAll('.hotspot').forEach((button) => {
        button.style.left = `${rect.left + (Number(button.dataset.x) / 100) * rect.width}px`;
        button.style.top = `${rect.top + (Number(button.dataset.y) / 100) * rect.height}px`;
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
        const isVisible = hasFutureVisible && button.offsetLeft > sliderX + 10;
        button.classList.toggle('future-visible', isVisible);
        if (!isVisible && activeButton === button) closeCard();
      });
    }
    function openCard(item, button) {
      if (!button.classList.contains('future-visible')) return;
      activeButton?.classList.remove('active'); activeButton = button; button.classList.add('active');
      cardImage.src = item.image || ''; cardImage.alt = item.title || '';
      cardTitle.textContent = item.title || ''; cardText.textContent = item.text || ''; card.hidden = false;
      const c = container.getBoundingClientRect(), b = button.getBoundingClientRect(), cardWidth = Math.min(360, c.width - 32);
      const left = Math.max(16, Math.min(c.width - cardWidth - 16, b.left - c.left - cardWidth / 2));
      let top = b.top - c.top - 270; if (top < 110) top = b.top - c.top + 42; if (top + 340 > c.height) top = c.height - 350;
      card.style.left = `${left}px`; card.style.top = `${Math.max(96, top)}px`;
    }
    function closeCard() { card.hidden = true; activeButton?.classList.remove('active'); activeButton = null; }
    function renderHotspots(items) {
      hotspotsEl.innerHTML = '';
      items.forEach((item) => {
        const button = document.createElement('button'); button.className = 'hotspot'; button.type = 'button'; button.dataset.x = item.x; button.dataset.y = item.y; button.setAttribute('aria-label', item.title || 'Hotspot');
        button.innerHTML = `<span class="hotspot-dot"></span><span class="hotspot-tooltip"></span>`;
        button.querySelector('.hotspot-tooltip').textContent = item.title || '';
        button.addEventListener('click', e => { e.stopPropagation(); openCard(item, button); });
        hotspotsEl.appendChild(button);
      });
      positionHotspots();
    }
    fetch(dataFile).then(r => r.ok ? r.json() : []).then(renderHotspots).catch(() => renderHotspots([]));
    document.addEventListener('compare:change', e => { if (e.detail.container === container) updateHotspotVisibility(e.detail.percent); });
    if (image.complete) positionHotspots(); image.addEventListener('load', positionHotspots); window.addEventListener('resize', positionHotspots);
    cardClose?.addEventListener('click', closeCard); container.addEventListener('click', e => { if (!card.hidden && !card.contains(e.target)) closeCard(); });
  });
})();

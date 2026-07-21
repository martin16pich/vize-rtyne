(function () {
  const sectionFiles = {
    zabarna: 'data/hotspots.json',
    kampelicka: 'data/kampelicka-hotspots.json',
    hornicka: 'data/hornicka-hotspots.json',
    namesti: 'data/namesti-hotspots.json',
    centrum: 'data/centrum-hotspots.json',
    odpady: 'data/odpady-hotspots.json',
    'rtynsky-trail': 'data/rtynsky-trail-hotspots.json',
    'bezecke-trasy-palenka': 'data/palenka-hotspots.json'
  };

  const MOBILE_BREAKPOINT = 820;
  const isMobile = () =>
    window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`).matches;

  const mobileImagePath = (path) =>
    path ? path.replace(/\.[^./]+$/, '-mobile.webp') : '';

  const backdrop = document.createElement('div');
  backdrop.className = 'vision-gallery-backdrop';
  backdrop.hidden = true;

  const modal = document.createElement('section');
  modal.className = 'vision-gallery';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('tabindex', '-1');

  modal.innerHTML = `
    <button class="vision-gallery__close" type="button" aria-label="Zavřít">×</button>
    <div class="vision-gallery__media">
      <img class="vision-gallery__image" src="" alt="">
    </div>
    <div class="vision-gallery__content">
      <div class="vision-gallery__meta">
        <span class="vision-gallery__place"></span>
        <span class="vision-gallery__counter"></span>
      </div>
      <h2 class="vision-gallery__title"></h2>
      <p class="vision-gallery__text"></p>
      <div class="vision-gallery__controls">
        <button class="vision-gallery__prev" type="button" aria-label="Předchozí vize">←</button>
        <button class="vision-gallery__next" type="button" aria-label="Další vize">→</button>
      </div>
    </div>`;

  document.body.append(backdrop, modal);

  const closeButton = modal.querySelector('.vision-gallery__close');
  const prevButton = modal.querySelector('.vision-gallery__prev');
  const nextButton = modal.querySelector('.vision-gallery__next');
  const imageEl = modal.querySelector('.vision-gallery__image');
  const titleEl = modal.querySelector('.vision-gallery__title');
  const textEl = modal.querySelector('.vision-gallery__text');
  const placeEl = modal.querySelector('.vision-gallery__place');
  const counterEl = modal.querySelector('.vision-gallery__counter');

  let currentItems = [];
  let currentIndex = 0;
  let currentPlace = '';
  let currentTrigger = null;

  function renderGalleryItem() {
    if (!currentItems.length) return;

    const item = currentItems[currentIndex];
    const original = item.image || '';
    const preferred = isMobile() ? mobileImagePath(original) : original;

    imageEl.hidden = !original;

    if (original) {
      imageEl.onerror = () => {
        imageEl.onerror = null;
        imageEl.src = original;
      };
      imageEl.src = preferred;
      imageEl.alt = item.title || '';
    } else {
      imageEl.removeAttribute('src');
      imageEl.alt = '';
    }

    titleEl.textContent = item.title || '';
    textEl.textContent = item.text || '';
    placeEl.textContent = currentPlace;
    counterEl.textContent = `${currentIndex + 1} / ${currentItems.length}`;

    const disabled = currentItems.length < 2;
    prevButton.disabled = disabled;
    nextButton.disabled = disabled;
  }

  function openGallery(items, placeName, trigger) {
    if (!items.length) return;

    currentItems = items;
    currentPlace = placeName;
    currentTrigger = trigger;
    currentIndex = Math.max(
      0,
      Math.min(items.length - 1, Number(trigger.dataset.lastIndex || 0))
    );

    renderGalleryItem();
    backdrop.hidden = false;
    modal.hidden = false;
    document.body.classList.add('vision-gallery-open');

    requestAnimationFrame(() => modal.focus({ preventScroll: true }));
  }

  function closeGallery() {
    if (currentTrigger) {
      currentTrigger.dataset.lastIndex = String(currentIndex);
    }

    modal.hidden = true;
    backdrop.hidden = true;
    document.body.classList.remove('vision-gallery-open');
    currentTrigger?.focus({ preventScroll: true });

    currentItems = [];
    currentPlace = '';
    currentTrigger = null;
  }

  function previousItem() {
    if (currentItems.length < 2) return;
    currentIndex =
      (currentIndex - 1 + currentItems.length) % currentItems.length;
    renderGalleryItem();
  }

  function nextItem() {
    if (currentItems.length < 2) return;
    currentIndex = (currentIndex + 1) % currentItems.length;
    renderGalleryItem();
  }

  closeButton.addEventListener('click', closeGallery);
  prevButton.addEventListener('click', previousItem);
  nextButton.addEventListener('click', nextItem);
  backdrop.addEventListener('click', (event) => event.preventDefault());

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'ArrowLeft') previousItem();
    if (event.key === 'ArrowRight') nextItem();
  });

  Object.entries(sectionFiles).forEach(([sectionId, dataFile]) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    let hotspotsEl = container.querySelector('.hotspots');
    if (!hotspotsEl) {
      hotspotsEl = document.createElement('div');
      hotspotsEl.className = 'hotspots';
      hotspotsEl.dataset.hotspots = dataFile;
      container.appendChild(hotspotsEl);
    }

    let card = container.querySelector('.info-card');
    if (!card) {
      card = document.createElement('article');
      card.className = 'info-card';
      card.hidden = true;
      card.innerHTML =
        '<button class="card-close" type="button" aria-label="Zavřít kartu">×</button>' +
        '<img src="" alt="">' +
        '<div class="card-body"><h2></h2><p></p></div>';
      container.appendChild(card);
    }

    let mobileButton = container.querySelector('.mobile-vision-button');
    if (!mobileButton) {
      mobileButton = document.createElement('button');
      mobileButton.className = 'mobile-vision-button';
      mobileButton.type = 'button';
      mobileButton.hidden = true;
      container.appendChild(mobileButton);
    }

    const image = container.querySelector('.compare-future');
    const slider = container.querySelector('.compare-range');
    if (!image || !slider) return;

    const cardClose = card.querySelector('.card-close');
    const cardImage = card.querySelector('img');
    const cardTitle = card.querySelector('.card-body h2');
    const cardText = card.querySelector('.card-body p');

    let items = [];
    let activeButton = null;
    let comparePercent = Number(slider.value || 50);

    const getPlaceName = () =>
      container.querySelector('.title-card h1')?.textContent?.trim() ||
      container.getAttribute('aria-label') ||
      sectionId;

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
        button.style.left =
          `${rect.left + (Number(button.dataset.x) / 100) * rect.width}px`;
        button.style.top =
          `${rect.top + (Number(button.dataset.y) / 100) * rect.height}px`;
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
        const visible =
          hasFutureVisible && button.offsetLeft > sliderX + 10;
        button.classList.toggle('future-visible', visible);
      });

      mobileButton.classList.toggle(
        'is-visible',
        hasFutureVisible && items.length > 0
      );
    }

    function closeDesktopCard() {
      card.hidden = true;
      activeButton?.classList.remove('active');
      activeButton = null;
    }

    function openDesktopCard(item, button) {
      if (isMobile() || !button.classList.contains('future-visible')) return;

      activeButton?.classList.remove('active');
      activeButton = button;
      button.classList.add('active');

      cardImage.hidden = !item.image;
      if (item.image) {
        cardImage.src = item.image;
        cardImage.alt = item.title || '';
      }

      cardTitle.textContent = item.title || '';
      cardText.textContent = item.text || '';
      card.hidden = false;

      const c = container.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      const cardWidth = Math.min(360, c.width - 32);
      const left = Math.max(
        16,
        Math.min(c.width - cardWidth - 16, b.left - c.left - cardWidth / 2)
      );

      let top = b.top - c.top - 270;
      if (top < 110) top = b.top - c.top + 42;
      if (top + 340 > c.height) top = c.height - 350;

      card.style.left = `${left}px`;
      card.style.top = `${Math.max(96, top)}px`;
    }

    function renderHotspots(data) {
      items = Array.isArray(data) ? data : [];
      hotspotsEl.innerHTML = '';

      items.forEach((item) => {
        const button = document.createElement('button');
        button.className = 'hotspot';
        button.type = 'button';
        button.dataset.x = item.x;
        button.dataset.y = item.y;
        button.setAttribute('aria-label', item.title || 'Hotspot');
        button.innerHTML =
          '<span class="hotspot-dot"></span>' +
          '<span class="hotspot-tooltip"></span>';

        button.querySelector('.hotspot-tooltip').textContent =
          item.title || '';

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          openDesktopCard(item, button);
        });

        hotspotsEl.appendChild(button);
      });

      mobileButton.innerHTML =
        `<span>Vize</span><strong>${items.length}</strong>`;
      mobileButton.hidden = items.length === 0;
      positionHotspots();
    }

    mobileButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openGallery(items, getPlaceName(), mobileButton);
    });

    fetch(dataFile)
      .then((response) => response.ok ? response.json() : [])
      .then(renderHotspots)
      .catch(() => renderHotspots([]));

    document.addEventListener('compare:change', (event) => {
      if (event.detail.container === container) {
        updateHotspotVisibility(event.detail.percent);
      }
    });

    if (image.complete) positionHotspots();
    image.addEventListener('load', positionHotspots);
    window.addEventListener('resize', () => {
      positionHotspots();
      if (isMobile()) closeDesktopCard();
    });

    cardClose?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeDesktopCard();
    });
  });
})();
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

  Object.entries(sectionFiles).forEach(([sectionId, dataFile]) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    let hotspotsEl = container.querySelector('.hotspots');

    if (!hotspotsEl) {
      hotspotsEl = document.createElement('div');
      hotspotsEl.className = 'hotspots';
      hotspotsEl.dataset.hotspots = dataFile;
      hotspotsEl.setAttribute(
        'aria-label',
        `Klikací body – ${container.getAttribute('aria-label') || sectionId}`
      );
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
  });

  /*
    Překryv je společný pro všechny hotspoty.
    Záměrně nemá obsluhu kliknutí – kartu lze zavřít pouze křížkem.
  */
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'hotspot-modal-backdrop';
  modalBackdrop.hidden = true;
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modalBackdrop);

  const hotspotContainers = Array.from(document.querySelectorAll('.hotspots'));

  let globallyOpen = null;

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
    let modalOriginalParent = null;
    let modalOriginalNextSibling = null;

    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'false');
    card.setAttribute('tabindex', '-1');

    function isMobile() {
      return window.matchMedia('(max-width: 820px)').matches;
    }

    function getCoverRect() {
      const containerRect = container.getBoundingClientRect();
      const naturalRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = containerRect.width / containerRect.height;

      let width;
      let height;
      let left;
      let top;

      if (boxRatio > naturalRatio) {
        width = containerRect.width;
        height = containerRect.width / naturalRatio;
        left = 0;
        top = (containerRect.height - height) / 2;
      } else {
        height = containerRect.height;
        width = containerRect.height * naturalRatio;
        top = 0;
        left = (containerRect.width - width) / 2;
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
        const isVisible =
          hasFutureVisible && button.offsetLeft > sliderX + 10;

        button.classList.toggle('future-visible', isVisible);
      });
    }

    function restoreCardToSection() {
      if (!modalOriginalParent) return;

      if (
        modalOriginalNextSibling &&
        modalOriginalNextSibling.parentNode === modalOriginalParent
      ) {
        modalOriginalParent.insertBefore(card, modalOriginalNextSibling);
      } else {
        modalOriginalParent.appendChild(card);
      }

      modalOriginalParent = null;
      modalOriginalNextSibling = null;
    }

    function closeCard() {
      card.hidden = true;
      card.classList.remove('is-open', 'hotspot-modal-card');
      card.setAttribute('aria-modal', 'false');

      card.style.removeProperty('left');
      card.style.removeProperty('top');

      restoreCardToSection();

      if (activeButton) {
        activeButton.classList.remove('active');
        activeButton.setAttribute('aria-expanded', 'false');
      }

      activeButton = null;

      if (globallyOpen?.card === card) {
        globallyOpen = null;
        modalBackdrop.hidden = true;
        document.body.classList.remove('hotspot-modal-open');
      }
    }

    function closePreviouslyOpenCard() {
      if (globallyOpen && globallyOpen.card !== card) {
        globallyOpen.close();
      }
    }

    function openCard(item, button) {
      if (!button.classList.contains('future-visible')) return;

      /*
        Opakované klepnutí na stejný aktivní hotspot nic nezavírá.
        Karta se zavírá výhradně křížkem, případně automaticky při
        otevření jiného hotspotu.
      */
      if (globallyOpen?.card === card && activeButton === button && !card.hidden) {
        return;
      }

      closePreviouslyOpenCard();

      if (activeButton && activeButton !== button) {
        activeButton.classList.remove('active');
        activeButton.setAttribute('aria-expanded', 'false');
      }

      activeButton = button;
      activeButton.classList.add('active');
      activeButton.setAttribute('aria-expanded', 'true');

      const hasImage = Boolean(item.image);

      cardImage.hidden = !hasImage;

      if (hasImage) {
        cardImage.src = item.image;
        cardImage.alt = item.title || '';
      } else {
        cardImage.removeAttribute('src');
        cardImage.alt = '';
      }

      cardTitle.textContent = item.title || '';
      cardText.textContent = item.text || '';

      card.hidden = false;
      card.classList.add('is-open');

      globallyOpen = {
        card,
        button,
        close: closeCard
      };

      if (isMobile()) {
        /*
          Kartu přesuneme přímo pod body, aby ji neomezoval stacking context
          jednotlivé fotografie. Díky tomu je opravdu nad celým webem.
        */
        if (card.parentNode !== document.body) {
          modalOriginalParent = card.parentNode;
          modalOriginalNextSibling = card.nextSibling;
          document.body.appendChild(card);
        }

        card.classList.add('hotspot-modal-card');
        card.setAttribute('aria-modal', 'true');

        modalBackdrop.hidden = false;
        document.body.classList.add('hotspot-modal-open');

        requestAnimationFrame(() => {
          card.focus({ preventScroll: true });
        });

        return;
      }

      /*
        Na desktopu zůstává karta umístěná u vybraného bodu.
        I zde však zůstává otevřená, dokud uživatel nepoužije křížek
        nebo neotevře jiný hotspot.
      */
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const cardWidth = Math.min(360, containerRect.width - 32);

      const left = Math.max(
        16,
        Math.min(
          containerRect.width - cardWidth - 16,
          buttonRect.left - containerRect.left - cardWidth / 2
        )
      );

      let top = buttonRect.top - containerRect.top - 270;

      if (top < 110) {
        top = buttonRect.top - containerRect.top + 42;
      }

      if (top + 340 > containerRect.height) {
        top = containerRect.height - 350;
      }

      card.style.left = `${left}px`;
      card.style.top = `${Math.max(96, top)}px`;
    }

    function renderHotspots(items) {
      hotspotsEl.innerHTML = '';

      items.forEach((item) => {
        const button = document.createElement('button');

        button.className = 'hotspot';
        button.type = 'button';
        button.dataset.x = item.x;
        button.dataset.y = item.y;
        button.setAttribute('aria-label', item.title || 'Hotspot');
        button.setAttribute('aria-expanded', 'false');

        button.innerHTML =
          '<span class="hotspot-dot"></span>' +
          '<span class="hotspot-tooltip"></span>';

        button.querySelector('.hotspot-tooltip').textContent =
          item.title || '';

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          openCard(item, button);
        });

        hotspotsEl.appendChild(button);
      });

      positionHotspots();
    }

    fetch(dataFile)
      .then((response) => response.ok ? response.json() : [])
      .then(renderHotspots)
      .catch(() => renderHotspots([]));

    document.addEventListener('compare:change', (event) => {
      if (event.detail.container === container) {
        updateHotspotVisibility(event.detail.percent);
      }
    });

    if (image.complete) {
      positionHotspots();
    }

    image.addEventListener('load', positionHotspots);
    window.addEventListener('resize', positionHotspots);

    /*
      Jediný způsob ručního zavření karty.
    */
    cardClose?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeCard();
    });
  });
})();

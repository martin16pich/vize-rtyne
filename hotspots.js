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

  const hotspotContainers = Array.from(document.querySelectorAll('.hotspots'));
  let globallyOpenCard = null;
  let globallyCloseCard = null;

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
    let openedAtScrollY = 0;

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

        if (!isVisible && activeButton === button) {
          closeCard();
        }
      });
    }

    function closeCard() {
      card.hidden = true;
      card.classList.remove('is-open');

      if (activeButton) {
        activeButton.classList.remove('active');
        activeButton.setAttribute('aria-expanded', 'false');
      }

      activeButton = null;

      if (globallyOpenCard === card) {
        globallyOpenCard = null;
        globallyCloseCard = null;
      }
    }

    function closeOtherCard() {
      if (globallyOpenCard && globallyOpenCard !== card && globallyCloseCard) {
        globallyCloseCard();
      }
    }

    function openCard(item, button) {
      if (!button.classList.contains('future-visible')) return;

      if (activeButton === button && !card.hidden) {
        closeCard();
        return;
      }

      closeOtherCard();

      if (activeButton) {
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

      globallyOpenCard = card;
      globallyCloseCard = closeCard;
      openedAtScrollY = window.scrollY;

      if (!isMobile()) {
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
      } else {
        card.style.removeProperty('left');
        card.style.removeProperty('top');

        requestAnimationFrame(() => {
          card.focus({ preventScroll: true });
        });
      }
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

    cardClose?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeCard();
    });

    /*
      Na mobilu se karta zavře po začátku rolování.
      Nebude tedy viset přes následující lokalitu nebo sekci O projektu.
    */
    window.addEventListener(
      'scroll',
      () => {
        if (
          !card.hidden &&
          isMobile() &&
          Math.abs(window.scrollY - openedAtScrollY) > 18
        ) {
          closeCard();
        }
      },
      { passive: true }
    );

    window.addEventListener('hashchange', closeCard);

    document.addEventListener('pointerdown', (event) => {
      if (card.hidden) return;
      if (card.contains(event.target)) return;
      if (event.target.closest('.hotspot')) return;

      closeCard();
    });
  });
})();

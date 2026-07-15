(function () {
  const compares = Array.from(document.querySelectorAll('.compare'));

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  compares.forEach((container) => {
    const before = container.querySelector('.compare-before');
    const slider = container.querySelector('.compare-range');
    const line = container.querySelector('.compare-line');

    if (!before || !slider || !line) return;

    let isDragging = false;
    let activePointerId = null;

    /*
      Nativní input range zůstává v HTML kvůli přístupnosti a ovládání
      klávesnicí, ale myší/prstem už neblokuje fotografii.
    */
    slider.style.pointerEvents = 'none';

    /*
      Svislé rolování stránky zůstává povolené.
      Vodorovný tah po fotografii ovládá porovnání.
    */
    container.style.touchAction = 'pan-y';

    function setPercent(percent, emitEvent = true) {
      const value = clamp(Number(percent) || 0, 0, 100);

      slider.value = String(value);
      before.style.width = `${value}%`;
      line.style.left = `${value}%`;

      if (emitEvent) {
        document.dispatchEvent(
          new CustomEvent('compare:change', {
            detail: {
              container,
              percent: value
            }
          })
        );
      }
    }

    function percentFromPointer(event) {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return Number(slider.value || 50);

      return ((event.clientX - rect.left) / rect.width) * 100;
    }

    function isInteractiveElement(target) {
      return Boolean(
        target.closest(
          '.hotspot, .info-card, .card-close, a, button, input:not(.compare-range), textarea, select'
        )
      );
    }

    function startDragging(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (isInteractiveElement(event.target)) return;

      isDragging = true;
      activePointerId = event.pointerId;

      try {
        container.setPointerCapture(event.pointerId);
      } catch (_) {
        // Některé starší prohlížeče pointer capture nepodporují.
      }

      setPercent(percentFromPointer(event));
    }

    function moveDragging(event) {
      if (!isDragging || event.pointerId !== activePointerId) return;
      setPercent(percentFromPointer(event));
    }

    function stopDragging(event) {
      if (!isDragging || event.pointerId !== activePointerId) return;

      isDragging = false;

      try {
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId);
        }
      } catch (_) {
        // Bezpečné ukončení i ve starších prohlížečích.
      }

      activePointerId = null;
    }

    container.addEventListener('pointerdown', startDragging);
    container.addEventListener('pointermove', moveDragging);
    container.addEventListener('pointerup', stopDragging);
    container.addEventListener('pointercancel', stopDragging);

    /*
      Ovládání klávesnicí zůstává funkční:
      Tabem se zaměří skrytý range a šipkami se mění pozice.
    */
    slider.addEventListener('input', () => {
      setPercent(Number(slider.value));
    });

    /*
      Po kliknutí na prázdnou část fotografie se jezdec přesune rovnou
      na dané místo. Pointerdown už změnu provede, click zde není potřeba.
    */

    setPercent(Number(slider.value || 50));
  });
})();

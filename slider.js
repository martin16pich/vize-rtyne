(function () {
  const sliders = document.querySelectorAll('.compare');

  sliders.forEach((container) => {
    const slider = container.querySelector('.compare-range');
    const beforeLayer = container.querySelector('.compare-before');
    const line = container.querySelector('.compare-line');

    if (!slider || !beforeLayer || !line) return;

    function setCompare(value) {
      const percent = Math.max(0, Math.min(100, Number(value)));
      beforeLayer.style.width = `${percent}%`;
      line.style.left = `${percent}%`;

      document.dispatchEvent(new CustomEvent('compare:change', {
        detail: { percent, container }
      }));
    }

    slider.addEventListener('input', () => setCompare(slider.value));
    setCompare(slider.value);
  });
})();

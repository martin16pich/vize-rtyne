/* ===========================================================
   NASTAVENÍ WEBU
   ZDE MĚŇ POUZE HODNOTY.

   sectionOrder:
   1 = první vize pod hlavní mapou
   2 = druhá vize
   atd.

   Stejné pořadí se použije:
   - pro fotografie na stránce,
   - pro menu „Místa“,
   - pro pořadí bodů hlavní mapy při ovládání klávesnicí.
   =========================================================== */

window.SETTINGS = {
  password: "ks40",

  sectionOrder: {
    centrum: 1,
    hornicka: 2,
    zabarna: 3,
    namesti: 4,
    kampelicka: 5,
    odpady: 6,
    "rtynsky-trail": 7,
    "bezecke-trasy-palenka": 8
  }
};

window.getSectionOrder = function (id) {
  return window.SETTINGS.sectionOrder[id] ?? 999;
};

window.applySectionOrder = function () {
  const main = document.querySelector("main");
  const about = document.getElementById("o-projektu");

  if (main && about) {
    const sections = Array.from(
      main.querySelectorAll("section.compare[id]")
    );

    sections
      .sort((a, b) =>
        window.getSectionOrder(a.id) - window.getSectionOrder(b.id)
      )
      .forEach((section) => main.insertBefore(section, about));
  }

  const menu = document.querySelector(".dropdown-menu");

  if (menu) {
    Array.from(menu.querySelectorAll('a[href^="#"]'))
      .sort((a, b) => {
        const aId = a.getAttribute("href").slice(1);
        const bId = b.getAttribute("href").slice(1);

        return window.getSectionOrder(aId) -
          window.getSectionOrder(bId);
      })
      .forEach((link) => menu.appendChild(link));
  }
};

/*
  config.js se načítá na konci index.html, takže celý obsah stránky
  už existuje. Řazení proto proběhne okamžitě ještě před script.js.
*/
window.applySectionOrder();

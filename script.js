(function () {
  /*
    Pojistka: pořadí aplikujeme ještě jednou před vytvořením navigace.
    Funkce je bezpečná a může se spustit opakovaně.
  */
  window.applySectionOrder?.();

  const links = Array.from(
    document.querySelectorAll(".nav a, .dropdown-menu a")
  );

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setActive() {
    let current = sections[0]?.id || "uvod";

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      if (rect.top <= window.innerHeight * 0.35) {
        current = section.id;
      }
    }

    document.querySelectorAll(".nav a").forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });
  }

  window.addEventListener("scroll", setActive, { passive: true });
  window.addEventListener("resize", setActive);

  setActive();
})();


/* ==========================================================
   BODY NA ÚVODNÍ MAPĚ
   ========================================================== */

(function () {
  const cityPoints = document.getElementById("cityPoints");

  if (!cityPoints) return;

  function goToSection(sectionId) {
    const target = document.getElementById(sectionId);

    if (!target) return;

    /*
      Nepoužíváme pouze výchozí skok kotvy.
      Pořadí sekcí je dynamické, proto vždy vyhledáme
      cílový element podle jeho skutečného ID.
    */
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    if (window.location.hash !== `#${sectionId}`) {
      history.pushState(null, "", `#${sectionId}`);
    }
  }

  function renderCityPlaces(places) {
    cityPoints.innerHTML = "";

    const orderedPlaces = [...places].sort(
      (a, b) =>
        (window.getSectionOrder?.(a.id) ?? 999) -
        (window.getSectionOrder?.(b.id) ?? 999)
    );

    orderedPlaces.forEach((place) => {
      const link = document.createElement("a");

      link.className = "city-hotspot";
      link.href = `#${place.id}`;

      link.style.setProperty("--x", `${place.x}%`);
      link.style.setProperty("--y", `${place.y}%`);

      link.setAttribute("aria-label", place.title);

      const tooltip = document.createElement("span");

      tooltip.className = "city-tooltip";
      tooltip.textContent = place.title;

      const supportedIcons = [
        "arrow-right",
        "arrow-left",
        "arrow-down"
      ];

      if (supportedIcons.includes(place.icon)) {
        link.classList.add(place.icon);
        link.dataset.icon = place.icon;
      }

      link.appendChild(tooltip);

      link.addEventListener("click", (event) => {
        event.preventDefault();

        goToSection(place.id);
      });

      cityPoints.appendChild(link);
    });
  }

  fetch("data/places.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Soubor places.json se nepodařilo načíst."
        );
      }

      return response.json();
    })
    .then(renderCityPlaces)
    .catch(() => {
      cityPoints.innerHTML = "";
    });
})();


/* ==========================================================
   MOBILNÍ ROZBALOVACÍ MENU MÍSTA
   ========================================================== */

(function () {
  const dropdown = document.querySelector(".dropdown");
  const toggle = document.querySelector(".dropdown-toggle");
  const menu = document.querySelector(".dropdown-menu");

  if (!dropdown || !toggle || !menu) return;

  function closeMenu() {
    dropdown.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    dropdown.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dropdown.classList.contains("open")
      ? closeMenu()
      : openMenu();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
})();


/* ==========================================================
   ÚVODNÍ OBRAZOVKA
   Zobrazí se při každém načtení stránky.
   ========================================================== */

(function () {
  const welcomeScreen =
    document.getElementById("welcomeScreen");

  const welcomeContinue =
    document.getElementById("welcomeContinue");

  if (!welcomeScreen || !welcomeContinue) return;

  welcomeContinue.addEventListener("click", function () {
    welcomeScreen.classList.add("is-hidden");

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo(0, 0);
  });
})();


/* ==========================================================
   MOBIL – NAČÍTÁNÍ OBRÁZKŮ VE DVOU KROCÍCH

   KROK 1:
   všechny hlavní fotografie Současnost + Vize

   KROK 2:
   teprve potom fotografie hotspotů
   ========================================================== */

(function () {
  /*
    Toto přednačítání používáme pouze na mobilu.
  */
  if (!window.matchMedia("(max-width: 820px)").matches) {
    return;
  }


  /* ----------------------------------------------------------
     Pomocná funkce pro načtení jednoho obrázku
     ---------------------------------------------------------- */

  function preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve();
        return;
      }

      const image = new Image();

      image.onload = () => resolve();
      image.onerror = () => resolve();

      image.src = src;
    });
  }


  /* ==========================================================
     KROK 1
     HLAVNÍ FOTOGRAFIE SOUČASNOST + VIZE
     ========================================================== */

  async function preloadMainImages() {
    const sections = Array.from(
      document.querySelectorAll(".compare")
    );

    const mobileImages = [];

    sections.forEach((section) => {
      /*
        Projdeme všechny hlavní <picture> elementy
        uvnitř porovnávací sekce.
      */
      const pictures = Array.from(
        section.querySelectorAll("picture")
      );

      pictures.forEach((picture) => {
        /*
          Mobilní source:
          např. images/centrum/vize-mobile.webp
        */
        const mobileSource = picture.querySelector(
          'source[media*="820"]'
        );

        const img = picture.querySelector("img");

        /*
          Hlavní obrázky na mobilu nechceme načítat lazy.
          Safari je má začít řešit okamžitě.
        */
        if (img) {
          img.removeAttribute("loading");

          /*
            Dáme hlavním obrázkům vyšší prioritu
            než doplňkovým fotografiím.
          */
          img.setAttribute(
            "fetchpriority",
            "high"
          );
        }

        /*
          Pro preload používáme přímo mobilní WebP.
        */
        if (mobileSource) {
          const src =
            mobileSource.getAttribute("srcset");

          if (src) {
            mobileImages.push(src);
          }
        }
      });
    });

    /*
      Kdyby se stejná cesta objevila vícekrát,
      nestahujeme ji opakovaně.
    */
    const uniqueImages = [
      ...new Set(mobileImages)
    ];

    /*
      Všechny hlavní mobilní fotografie
      spustíme paralelně.
    */
    await Promise.all(
      uniqueImages.map((src) =>
        preloadImage(src)
      )
    );
  }


  /* ==========================================================
     KROK 2
     OBRÁZKY HOTSPOTŮ
     ========================================================== */

  async function preloadHotspotImages() {
    const hotspotContainers = Array.from(
      document.querySelectorAll(
        ".hotspots[data-hotspots]"
      )
    );

    for (const container of hotspotContainers) {
      const jsonPath =
        container.dataset.hotspots;

      if (!jsonPath) continue;

      try {
        const response =
          await fetch(jsonPath);

        if (!response.ok) {
          continue;
        }

        const hotspots =
          await response.json();

        /*
          Hotspoty načítáme až po hlavních obrázcích.
        */
        for (const hotspot of hotspots) {
          if (!hotspot.image) continue;

          /*
            Z desktopové cesty vytvoříme cestu
            k mobilnímu WebP.

            Např.:

            lavicka.jpg

            →

            lavicka-mobile.webp
          */
          const mobileImage =
            hotspot.image.replace(
              /\.(jpg|jpeg|png|webp)$/i,
              "-mobile.webp"
            );

          await preloadImage(
            mobileImage
          );
        }
      } catch (error) {
        console.warn(
          "Nepodařilo se přednačíst hotspoty:",
          jsonPath
        );
      }
    }
  }


  /* ==========================================================
     SPUŠTĚNÍ NAČÍTÁNÍ
     ========================================================== */

  async function startMobilePreloading() {
    /*
      Nejdříve počkáme na všechny hlavní fotografie
      Současnost + Vize.
    */
    await preloadMainImages();

    /*
      Teprve potom spustíme hotspotové fotografie.
      Na ty už uživatel nemusí čekat při scrollování.
    */
    preloadHotspotImages();
  }

  startMobilePreloading();
})();
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

(function () {
  const cityPoints = document.getElementById("cityPoints");
  if (!cityPoints) return;

  function goToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    /*
      Nepoužíváme pouze výchozí skok kotvy. Pořadí sekcí je dynamické,
      proto vždy vyhledáme cílový element podle jeho skutečného ID.
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

    const orderedPlaces = [...places].sort((a, b) =>
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
        throw new Error("Soubor places.json se nepodařilo načíst.");
      }

      return response.json();
    })
    .then(renderCityPlaces)
    .catch(() => {
      cityPoints.innerHTML = "";
    });
})();

/* Mobilní rozbalovací menu Místa */
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
    link.addEventListener("click", () => closeMenu());
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

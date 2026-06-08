(function () {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (slides.length > 1) {
      next && next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
      prev && prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      start();
    }
  }

  const localSearch = document.querySelector("[data-category-search]");
  const filterList = document.querySelector("[data-filter-list]");

  if (localSearch && filterList) {
    const cards = Array.from(filterList.querySelectorAll("[data-filter-card]"));
    localSearch.addEventListener("input", function () {
      const value = localSearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        card.classList.toggle("is-filter-hidden", value && !text.includes(value));
      });
    });
  }

  const searchInput = document.querySelector("[data-global-search]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchSort = document.querySelector("[data-global-sort]");

  if (searchInput && searchResults && window.SEARCH_DATA) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    function card(item) {
      const tags = item.tags.slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\"><img src=\"./" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-glow\"></span></a>",
        "<div class=\"movie-card-body\">",
        "<div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
        "<p>" + escapeHtml(item.text) + "</p>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function render() {
      const query = searchInput.value.trim().toLowerCase();
      const sort = searchSort ? searchSort.value : "rank";
      let results = window.SEARCH_DATA.filter(function (item) {
        if (!query) {
          return true;
        }
        const text = [
          item.title,
          item.region,
          item.type,
          item.genre,
          item.year,
          item.tags.join(" "),
          item.text
        ].join(" ").toLowerCase();
        return text.includes(query);
      });
      if (sort === "year") {
        results = results.sort(function (a, b) {
          return Number(b.year) - Number(a.year);
        });
      }
      if (sort === "title") {
        results = results.sort(function (a, b) {
          return a.title.localeCompare(b.title, "zh-Hans-CN");
        });
      }
      searchResults.innerHTML = results.slice(0, 120).map(card).join("");
    }

    searchInput.addEventListener("input", render);
    searchSort && searchSort.addEventListener("change", render);
    render();
  }
})();

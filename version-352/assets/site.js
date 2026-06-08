(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  qsa(".nav-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = qs("[data-mobile-nav]");
      if (nav) {
        nav.classList.toggle("open");
      }
    });
  });

  qsa("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var keyword = input ? input.value.trim() : "";
      if (keyword) {
        window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
      }
    });
  });

  var hero = qs("[data-hero]");
  if (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(nextSlide, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });
    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  var backTop = qs(".back-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 360);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(item.href) + '" class="card-link" aria-label="' + escapeHtml(item.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '      <div class="poster-mask"></div>',
      '      <span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '      <p class="poster-desc">' + escapeHtml(item.oneLine) + '</p>',
      '    </div>',
      '    <div class="card-body">',
      '      <h2>' + escapeHtml(item.title) + '</h2>',
      '      <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '      <div class="chip-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  var resultBox = qs("[data-search-results]");
  if (resultBox && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var searchInput = qs('.big-search input[name="q"]');
    if (searchInput) {
      searchInput.value = q;
    }
    if (q) {
      var lower = q.toLowerCase();
      var matches = window.SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine].concat(item.tags || []).join(" ").toLowerCase();
        return text.indexOf(lower) !== -1;
      }).slice(0, 200);
      if (matches.length) {
        resultBox.innerHTML = matches.map(cardTemplate).join("");
      } else {
        resultBox.innerHTML = '<div class="search-empty">没有找到匹配内容，可以尝试更换片名、年份、地区或题材关键词。</div>';
      }
    }
  }

  qsa(".player-shell").forEach(function (shell) {
    var video = qs("video", shell);
    var cover = qs(".player-cover", shell);
    var stream = shell.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || !stream || ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      shell._player = hlsInstance;
      ready = true;
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("hidden");
      }
      if (video) {
        video.controls = true;
        var started = video.play();
        if (started && typeof started.catch === "function") {
          started.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
    }
  });
})();

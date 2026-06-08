(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupMenu() {
    var header = qs(".site-header");
    var toggle = qs(".nav-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearchForms() {
    qsa(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilter() {
    var input = qs(".filter-input");
    var cards = qsa(".movie-card");
    var empty = qs(".empty-message");
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var first = params.get("q") || "";
    if (first) {
      input.value = first;
    }
    function apply() {
      var keyword = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var source = normalize(card.getAttribute("data-search") || card.textContent);
        var matched = !keyword || source.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function startVideo(video, source, cover) {
    function playNow() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      playNow();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playNow();
      });
      return;
    }
    video.src = source;
    playNow();
  }

  window.SitePlayer = function (source) {
    var video = qs(".movie-video");
    var cover = qs(".player-cover");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    function activate() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (!loaded) {
        loaded = true;
        startVideo(video, source, cover);
      } else {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }
    if (cover) {
      cover.addEventListener("click", activate);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        activate();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilter();
  });
})();

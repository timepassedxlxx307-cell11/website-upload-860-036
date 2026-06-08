(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-card-grid]").forEach(function (grid) {
      var parent = grid.parentElement;
      var input = parent ? parent.querySelector("[data-search-input]") : null;
      var selects = parent ? Array.prototype.slice.call(parent.querySelectorAll("[data-filter-select]")) : [];
      var empty = parent ? parent.querySelector("[data-empty-state]") : null;
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

      function includesValue(source, value) {
        if (!value) {
          return true;
        }
        return String(source || "").toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
      }

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = String(card.getAttribute("data-search") || "").toLowerCase();
          var matched = !keyword || search.indexOf(keyword) !== -1;

          selects.forEach(function (select) {
            var field = select.getAttribute("data-filter-select");
            var value = select.value;
            if (value && !includesValue(card.getAttribute("data-" + field), value)) {
              matched = false;
            }
          });

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });
      applyFilter();
    });
  });

  window.setupVideoPlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("video-player");
      var cover = document.querySelector("[data-player-cover]");
      var started = false;
      var hlsInstance = null;

      if (!video || !streamUrl) {
        return;
      }

      function attachStream() {
        if (started) {
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attachStream();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  };
})();

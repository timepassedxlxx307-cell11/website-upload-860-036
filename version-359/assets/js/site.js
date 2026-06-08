(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[type="search"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResults = document.querySelector('[data-no-results]');

    function applyFilter() {
      if (!filterInput || !cards.length) {
        return;
      }
      var query = normalize(filterInput.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        filterInput.value = initial;
      }
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var active = 0;
      var timer = null;

      function setActive(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function schedule() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          setActive(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          setActive(index);
          schedule();
        });
      });

      setActive(0);
      schedule();
    }
  });
})();

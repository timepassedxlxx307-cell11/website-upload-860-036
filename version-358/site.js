(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function toggleNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function startHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show((active + 1) % slides.length);
    }, 5000);
  }

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterCards(input) {
    var scope = document.querySelector('.js-filter-scope');
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var value = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category
      ].join(' '));
      var matched = !value || haystack.indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function startFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-input'));
    if (!inputs.length) {
      return;
    }
    var query = getQueryValue();
    inputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        filterCards(input);
      });
      filterCards(input);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleNavigation();
    startHero();
    startFilters();
  });
})();

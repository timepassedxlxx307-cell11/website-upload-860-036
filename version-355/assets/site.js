(function () {
  'use strict';

  var header = document.querySelector('[data-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
    image.addEventListener('error', function () {
      var shell = image.closest('.poster-shell');
      if (shell) {
        shell.classList.add('image-missing');
      }
      image.style.display = 'none';
    }, { once: true });
  });

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var target = form.getAttribute('data-search-target') || form.getAttribute('action') || 'search.html';
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        return;
      }
      event.preventDefault();
      window.location.href = target + '?q=' + encodeURIComponent(query);
    });
  });

  initHeroSlider();
  initPageFilter();
  initSearchPage();
  initPlayers();

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(activeIndex + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPageFilter() {
    var filterInput = document.querySelector('[data-page-filter]');
    var grid = document.querySelector('[data-card-grid]');
    var count = document.querySelector('[data-filter-count]');
    if (!filterInput || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var totalText = count ? count.textContent : '';

    function applyFilter() {
      var keyword = filterInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = keyword ? (visible + ' / ' + cards.length + ' 部') : totalText;
      }
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  function initSearchPage() {
    var data = window.MOVIE_DATA;
    var form = document.querySelector('[data-live-search-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!data || !form || !results) {
      return;
    }

    var queryInput = form.querySelector('[data-search-query]');
    var typeSelect = form.querySelector('[data-search-type]');
    var regionSelect = form.querySelector('[data-search-region]');
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    if (queryInput) {
      queryInput.value = queryFromUrl;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderResults();
    });

    [queryInput, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderResults);
        control.addEventListener('change', renderResults);
      }
    });

    function escapeHTML(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHTML(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card" data-card>',
        '  <a href="' + escapeHTML(movie.url) + '" aria-label="观看 ' + escapeHTML(movie.title) + '">',
        '    <div class="poster-shell" data-title="' + escapeHTML(movie.title) + '">',
        '      <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" decoding="async" data-fallback-title="' + escapeHTML(movie.title) + '">',
        '      <div class="poster-gradient"></div>',
        '      <div class="play-hover" aria-hidden="true">▶</div>',
        '      <span class="year-chip">' + escapeHTML(movie.year) + '</span>',
        '    </div>',
        '    <div class="movie-card__body">',
        '      <h3>' + escapeHTML(movie.title) + '</h3>',
        '      <p>' + escapeHTML(movie.oneLine) + '</p>',
        '      <div class="meta-row"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>',
        '      <div class="tag-row">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function renderResults() {
      var keyword = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      var matched = data.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!type || movie.type === type)
          && (!region || movie.region === region);
      });

      var visible = matched.slice(0, 120);
      results.innerHTML = visible.map(renderCard).join('');
      results.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
        image.addEventListener('error', function () {
          var shell = image.closest('.poster-shell');
          if (shell) {
            shell.classList.add('image-missing');
          }
          image.style.display = 'none';
        }, { once: true });
      });

      if (summary) {
        if (matched.length) {
          summary.textContent = '找到 ' + matched.length + ' 条结果，当前显示 ' + visible.length + ' 条。';
        } else {
          summary.textContent = '没有找到匹配内容，请尝试更短的关键词。';
        }
      }
    }

    renderResults();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var playButton = player.querySelector('[data-play-button]');
      var sourceButtons = player.parentElement ? player.parentElement.querySelectorAll('[data-source]') : [];
      var hls = null;
      var loadedSource = '';

      if (!video) {
        return;
      }

      function loadSource(source) {
        if (!source || loadedSource === source) {
          return;
        }
        loadedSource = source;
        player.classList.add('is-loaded');
        if (hls) {
          hls.destroy();
          hls = null;
        }
        video.pause();
        video.removeAttribute('src');
        video.load();

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
          video.load();
        }
      }

      function play() {
        var source = video.getAttribute('data-src');
        loadSource(source);
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (playButton) {
        playButton.addEventListener('click', function () {
          playButton.classList.add('is-hidden');
          player.classList.add('is-playing');
          play();
        });
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      sourceButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          sourceButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          var source = button.getAttribute('data-source');
          video.setAttribute('data-src', source);
          loadSource(source);
          if (!video.paused) {
            video.play();
          }
        });
      });
    });
  }
})();

(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var section = input.closest('section') || document;
    var list = section.querySelector('[data-filter-list]') || document;
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
        item.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var results = document.querySelector('[data-search-results]');
  if (results && Array.isArray(window.MOVIE_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var summary = document.querySelector('[data-search-summary]');
    var source = window.MOVIE_INDEX;

    function render(list) {
      results.innerHTML = list.map(function (movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
          '<article class="movie-card">',
          '<a href="./' + movie.file + '" class="movie-link" title="' + escapeHtml(movie.title) + ' 在线观看">',
          '<div class="poster-wrap">',
          '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="year-badge">' + movie.year + '</span>',
          '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
          '<span class="play-float">▶</span>',
          '</div>',
          '<div class="card-body">',
          '<h3>' + escapeHtml(movie.title) + '</h3>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="tag-row">' + tags + '</div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    var list = source;
    if (keyword) {
      var lower = keyword.toLowerCase();
      list = source.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(lower) !== -1;
      });
      if (summary) {
        summary.textContent = '关键词“' + keyword + '”的匹配结果。';
      }
    } else {
      list = source.slice(0, 80);
      if (summary) {
        summary.textContent = '显示部分片库内容，可输入关键词继续搜索。';
      }
    }

    render(list.slice(0, 240));
  }
})();

(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeText(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function openMenu() {
        var menu = qs('[data-mobile-nav]');
        if (menu) {
            menu.classList.toggle('is-open');
        }
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        if (button) {
            button.addEventListener('click', openMenu);
        }
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function renderSearchResults(items, container) {
        if (!container) {
            return;
        }
        container.innerHTML = items.map(function (item) {
            return '<a class="search-item" href="' + item.url + '">' +
                '<strong>' + escapeText(item.title) + '</strong>' +
                '<span>' + escapeText(item.year) + ' · ' + escapeText(item.region) + ' · ' + escapeText(item.category) + '</span>' +
                '</a>';
        }).join('');
        container.classList.toggle('is-visible', items.length > 0);
    }

    function initSiteSearch() {
        var input = qs('[data-site-search]');
        var button = qs('[data-site-search-button]');
        var results = qs('[data-site-search-results]');
        if (!input || !results || !window.MovieIndex) {
            return;
        }
        function search() {
            var value = input.value.trim().toLowerCase();
            if (!value) {
                results.classList.remove('is-visible');
                results.innerHTML = '';
                return;
            }
            var items = window.MovieIndex.filter(function (item) {
                return [item.title, item.year, item.region, item.genre, item.category, item.tags].join(' ').toLowerCase().indexOf(value) >= 0;
            }).slice(0, 12);
            renderSearchResults(items, results);
        }
        input.addEventListener('input', search);
        if (button) {
            button.addEventListener('click', search);
        }
    }

    function initPageFilter() {
        var keyword = qs('[data-filter-keyword]');
        var year = qs('[data-filter-year]');
        var genre = qs('[data-filter-genre]');
        var cards = qsa('[data-filter-card]');
        var empty = qs('[data-no-match]');
        if (!cards.length || !keyword) {
            return;
        }
        function apply() {
            var word = keyword.value.trim().toLowerCase();
            var yearValue = year ? year.value : '';
            var genreValue = genre ? genre.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
                var matched = (!word || text.indexOf(word) >= 0) && (!yearValue || card.dataset.year === yearValue) && (!genreValue || card.dataset.genre.indexOf(genreValue) >= 0);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [keyword, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    window.setupVideoPlayer = function (videoId, buttonId, maskId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var mask = document.getElementById(maskId);
        if (!video || !streamUrl) {
            return;
        }
        var ready = false;
        function bind() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            bind();
            if (mask) {
                mask.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
        if (mask) {
            mask.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (mask) {
                mask.classList.add('is-hidden');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSiteSearch();
        initPageFilter();
    });
})();

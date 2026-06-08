document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-menu]");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();

        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });
    }

    var localFilter = document.querySelector("[data-local-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyFilter(value) {
        var words = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);

        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region")
            ].join(" ").toLowerCase();

            var visible = words.every(function (word) {
                return text.indexOf(word) !== -1;
            });

            card.classList.toggle("hidden-card", !visible);
        });
    }

    if (localFilter && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            localFilter.value = query;
            applyFilter(query);
        }

        localFilter.addEventListener("input", function () {
            applyFilter(localFilter.value);
        });
    }
});

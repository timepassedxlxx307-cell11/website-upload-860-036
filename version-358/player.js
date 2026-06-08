(function () {
  function attachPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var url = box.getAttribute('data-video-url');
    var loaded = false;

    function load() {
      if (loaded || !video || !url) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('loadedmetadata', function () {
      if (overlay && !video.paused) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(attachPlayer);
  });
})();

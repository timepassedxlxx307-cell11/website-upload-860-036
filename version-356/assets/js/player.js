(function () {
  function preparePlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.player-cover');
    var source = video ? video.querySelector('source') : null;
    var url = source ? source.getAttribute('src') : '';
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function attachSource() {
      if (video.dataset.ready === 'true') {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.dataset.ready = 'true';
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        video.dataset.ready = 'true';
        return Promise.resolve();
      }

      video.src = url;
      video.dataset.ready = 'true';
      return Promise.resolve();
    }

    function playVideo() {
      attachSource().then(function () {
        wrapper.classList.add('is-playing');
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {
            wrapper.classList.remove('is-playing');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      wrapper.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.movie-player').forEach(preparePlayer);
})();

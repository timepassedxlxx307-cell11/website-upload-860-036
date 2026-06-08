(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var message = document.getElementById(config.messageId);
    var source = config.source;
    var attached = false;
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放暂时不可用');
            if (hls) {
              hls.destroy();
              hls = null;
            }
            attached = false;
          }
        });
      } else {
        video.src = source;
      }
    }

    function playNow() {
      if (!video) {
        return;
      }
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showMessage('点击播放器继续观看');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playNow);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          playNow();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        showMessage('');
      });
    }
  }

  window.initMoviePlayer = initMoviePlayer;
})();

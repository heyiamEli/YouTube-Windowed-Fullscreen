(() => {
  'use strict';

  const ROOT_CLASS = 'ext-yt-vfs';
  const BUTTON_SELECTOR = '[data-ext-yt-vfs-button="true"]';

  const ICON_SVG = `
    <svg height="24" viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
      <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
      <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
    </svg>
  `;

  function isWatchPage() {
    return location.hostname === 'www.youtube.com' && location.pathname === '/watch';
  }

  function isModeOn() {
    return document.documentElement.classList.contains(ROOT_CLASS);
  }

  function syncButton(button) {
    if (!button) return;

    const enabled = isModeOn();
    const label = enabled ? 'Exit viewport fullscreen' : 'Viewport fullscreen';

    button.setAttribute('title', label);
    button.setAttribute('aria-label', label);
  }

  function notifyResize() {
    window.dispatchEvent(new Event('resize'));
  }

  function isTheaterModeOn() {
    return !!document.querySelector('ytd-watch-flexy[theater]');
  }

  function isNativeFullscreenOn() {
    return !!document.fullscreenElement;
  }

  function getNativeTheaterButton() {
    return document.querySelector(
      '.ytp-right-controls-right .ytp-size-button'
    );
  }

  function enableMode() {
    document.documentElement.classList.add(ROOT_CLASS);

    const button = document.querySelector(BUTTON_SELECTOR);
    syncButton(button);

    notifyResize();
  }

  function disableMode() {
    document.documentElement.classList.remove(ROOT_CLASS);

    const button = document.querySelector(BUTTON_SELECTOR);
    syncButton(button);

    notifyResize();
  }

  function enterMode() {
    if (isNativeFullscreenOn()) {
      document.exitFullscreen().then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            enableMode();
          });
        });
      });
      return;
    }

    if (isTheaterModeOn()) {
      enableMode();
      const theaterButton = getNativeTheaterButton();
      if (theaterButton) {
        theaterButton.click();
      }
      return;
    }

    enableMode();
  }

  function toggleMode() {
    if (!isWatchPage()) return;

    if (isModeOn()) {
      disableMode();
    } else {
      enterMode();
    }
  }

  function injectButton() {
    if (!isWatchPage()) return;

    const controls = document.querySelector('.ytp-right-controls-right');
    const fullscreenButton = document.querySelector('.ytp-fullscreen-button');

    if (!controls || !fullscreenButton) return;
    if (controls.querySelector(BUTTON_SELECTOR)) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ytp-button ext-yt-vfs-button';
    button.dataset.extYtVfsButton = 'true';
    button.innerHTML = ICON_SVG;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMode();
    });

    controls.insertBefore(button, fullscreenButton);
    syncButton(button);
  }

  function observeTheaterMode(watchFlexy) {
    const observer = new MutationObserver(() => {
      if (isModeOn() && isTheaterModeOn()) {
        disableMode();
      }
    });

    observer.observe(watchFlexy, {
      attributes: true,
      attributeFilter: ['theater']
    });
  }

  function observeFullscreen(moviePlayer) {
    const observer = new MutationObserver(() => {
      if (isModeOn() && moviePlayer.classList.contains('ytp-fullscreen')) {
        disableMode();
      }
    });

    observer.observe(moviePlayer, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function observeFullscreenClick() {
    document.addEventListener('click', (event) => {
      if (!isModeOn()) return;
      if (event.target.closest('.ytp-fullscreen-button')) {
        disableMode();
      }
    }, true);
  }

  function observeHotkeys() {
    document.addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName;
      const isTyping =
        tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (isTyping) return;

      if (event.key === '`') {
        toggleMode();
      }

      if (event.key.toLowerCase() === 'f' && isModeOn()) {
        disableMode();
      }
    }, true);
  }
  let observersReady = false;

  function setupOnce() {
    if (observersReady) return;

    const watchFlexy = document.querySelector('ytd-watch-flexy');
    const moviePlayer = document.querySelector('#movie_player');

    if (!watchFlexy || !moviePlayer) return;

    observeTheaterMode(watchFlexy);
    observeFullscreen(moviePlayer);
    observeHotkeys()
    observeFullscreenClick();
    observersReady = true;
  }

  function init() {
    setupOnce();
    setTimeout(injectButton, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('yt-navigate-finish', init);
})();

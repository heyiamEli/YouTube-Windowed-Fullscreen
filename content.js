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

    const enabled = document.documentElement.classList.contains(ROOT_CLASS);
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
    if (isTheaterModeOn()) {
      const theaterButton = getNativeTheaterButton();

      if (theaterButton) {
        theaterButton.click();
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          enableMode();
        });
      });

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

  function observeTheaterMode() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (!watchFlexy) return;

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

  function observeFullscreen() {
    const moviePlayer = document.querySelector('#movie_player');
    if (!moviePlayer) return;

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

function setupOnce() {
  observeTheaterMode();
  observeFullscreen();
}
function init() {
  setTimeout(injectButton, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {setupOnce();init();}, { once: true });
} else {
  setupOnce();
  init();
}

document.addEventListener('yt-navigate-finish', init);
})

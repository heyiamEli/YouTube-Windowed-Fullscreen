const toggleBtn = document.getElementById('toggle-btn');
const shortcutInput = document.getElementById('shortcut-input');
const YOUTUBE_RESERVED_KEYS = [      
  'f', 't', 'k', 'm', 'j', 'l',
  'c', 'b', 'i', 'o', 'u',
  ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'Home', 'End',
];

// ─── Helpers ────────────────────────────────────────────────

function getActiveYouTubeTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isYouTubeWatch =
      tab && tab.url && tab.url.includes('youtube.com/watch');
    callback(isYouTubeWatch ? tab : null);
  });
}

function sendToTab(tab, message, callback) {
  chrome.tabs.sendMessage(tab.id, message, (response) => {
    if (chrome.runtime.lastError) return;
    if (callback) callback(response);
  });
}

// ─── Toggle button ──────────────────────────────────────────

function updateToggleBtn(isOn) {
  if (isOn) {
    toggleBtn.textContent = 'Exit viewport fullscreen';
    toggleBtn.classList.add('active');
  } else {
    toggleBtn.textContent = 'Enter viewport fullscreen';
    toggleBtn.classList.remove('active');
  }
}

function initToggle() {
  getActiveYouTubeTab((tab) => {
    if (!tab) {
      toggleBtn.textContent = 'Open a YouTube video first';
      toggleBtn.disabled = true;
      return;
    }

    sendToTab(tab, { action: 'getState' }, (response) => {
      if (response) updateToggleBtn(response.isOn);
    });

    toggleBtn.addEventListener('click', () => {
      sendToTab(tab, { action: 'toggle' }, (response) => {
        if (response) updateToggleBtn(response.isOn);
      });
    });
  });
}

// ─── Shortcut input ─────────────────────────────────────────

function initShortcut() {
   const warningEl = document.getElementById('shortcut-warning');

  chrome.storage.sync.get('shortcut', (result) => {
    shortcutInput.value = result.shortcut || '`';
  });

  shortcutInput.addEventListener('keydown', (event) => {
    event.preventDefault();

    const key = event.key;

    const ignored = [
      'Shift', 'Control', 'Alt', 'Meta',
      'Tab', 'Enter', 'Escape', 'Backspace'
    ];
    if (ignored.includes(key)) return;
    
    if (YOUTUBE_RESERVED_KEYS.includes(key.toLowerCase())) {
      warningEl.textContent = `'${key}' is a YouTube shortcut and cannot be assigned.`;
      shortcutInput.value = shortcutInput.dataset.lastSaved || '`';
      return;
    }

    warningEl.textContent = '';

    shortcutInput.value = key;
    chrome.storage.sync.set({ shortcut: key });
  });
}

// ─── Init ────────────────────────────────────────────────────

initToggle();
initShortcut();
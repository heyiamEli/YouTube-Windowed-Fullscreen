const shortcutInput = document.getElementById('shortcut-input');
const YOUTUBE_RESERVED_KEYS = [      
  'f', 't', 'k', 'm', 'j', 'l',
  'c', 'b', 'i', 'o', 'u',
  ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'Home', 'End',
];

// ─── Shortcut input ─────────────────────────────────────────

function initShortcut() {
   const warningEl = document.getElementById('shortcut-warning');

  chrome.storage.sync.get('shortcut', (result) => {
    const savedShortcut = result.shortcut || '`';
    shortcutInput.value = savedShortcut;
    shortcutInput.dataset.lastSaved = savedShortcut;
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
    shortcutInput.dataset.lastSaved = key;
    chrome.storage.sync.set({ shortcut: key });
  });
}

// ─── Init ────────────────────────────────────────────────────

initShortcut();

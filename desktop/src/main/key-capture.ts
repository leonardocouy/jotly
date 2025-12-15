/**
 * Key Capture Window - Modal for capturing new hotkey combinations
 */

import { BrowserWindow, ipcMain } from 'electron';

export interface KeyCaptureResult {
  success: boolean;
  accelerator?: string;
  cancelled?: boolean;
}

/**
 * Convert key event to Electron accelerator format
 */
function keyEventToAccelerator(
  key: string,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
): string | null {
  // Build modifier string
  const modifiers: string[] = [];

  if (ctrlKey) modifiers.push('Control');
  if (shiftKey) modifiers.push('Shift');
  if (altKey) modifiers.push('Alt');
  if (metaKey) modifiers.push('Super'); // Meta key is Super on Linux

  // Require at least one modifier for global shortcuts
  if (modifiers.length === 0) {
    return null;
  }

  // Normalize the key
  let normalizedKey = key;

  // Handle special keys
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Escape',
    Enter: 'Enter',
    Tab: 'Tab',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
  };

  if (keyMap[key]) {
    normalizedKey = keyMap[key];
  } else if (key.length === 1) {
    // Single character - uppercase it
    normalizedKey = key.toUpperCase();
  } else if (key.startsWith('F') && /^F\d+$/.test(key)) {
    // Function keys (F1-F12)
    normalizedKey = key;
  } else if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    // Modifier-only press, wait for actual key
    return null;
  } else {
    // Unknown key, reject
    return null;
  }

  return [...modifiers, normalizedKey].join('+');
}

/**
 * Inline HTML for the capture dialog (avoids external file)
 */
function getDialogHTML(currentHotkey: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Change Shortcut</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1e1e1e;
      color: #ffffff;
      padding: 20px;
      user-select: none;
      -webkit-app-region: drag;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    h2 {
      font-size: 16px;
      font-weight: 500;
    }
    .current {
      font-size: 12px;
      color: #888;
    }
    .capture-area {
      width: 100%;
      padding: 16px;
      background: #2d2d2d;
      border: 2px dashed #444;
      border-radius: 8px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #4fc3f7;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .capture-area.listening {
      border-color: #4fc3f7;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { border-color: #4fc3f7; }
      50% { border-color: #81d4fa; }
    }
    .hint {
      font-size: 11px;
      color: #666;
    }
    .buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      -webkit-app-region: no-drag;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .btn-cancel {
      background: #444;
      color: #fff;
    }
    .btn-cancel:hover { background: #555; }
    .btn-save {
      background: #4fc3f7;
      color: #000;
    }
    .btn-save:hover { background: #81d4fa; }
    .btn-save:disabled {
      background: #333;
      color: #666;
      cursor: not-allowed;
    }
    .btn-reset {
      background: transparent;
      color: #888;
      font-size: 11px;
    }
    .btn-reset:hover { color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Change Recording Shortcut</h2>
    <p class="current">Current: <strong id="current">${currentHotkey}</strong></p>
    <div class="capture-area listening" id="capture-area">
      Press new shortcut...
    </div>
    <p class="hint">Use modifier keys (Ctrl, Shift, Alt, Super) + a key</p>
    <div class="buttons">
      <button class="btn-reset" id="btn-reset">Reset to Default</button>
      <button class="btn-cancel" id="btn-cancel">Cancel</button>
      <button class="btn-save" id="btn-save" disabled>Save</button>
    </div>
  </div>
  <script>
    const { ipcRenderer } = require('electron');

    let capturedAccelerator = null;
    const captureArea = document.getElementById('capture-area');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const btnReset = document.getElementById('btn-reset');

    // Listen for key presses
    document.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Send key data to main process for conversion
      ipcRenderer.send('key-capture:keydown', {
        key: e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });
    }, true);

    // Receive converted accelerator from main
    ipcRenderer.on('key-capture:accelerator', (event, accelerator) => {
      if (accelerator) {
        capturedAccelerator = accelerator;
        captureArea.textContent = accelerator;
        captureArea.classList.remove('listening');
        btnSave.disabled = false;
      }
    });

    // Button handlers
    btnSave.addEventListener('click', () => {
      if (capturedAccelerator) {
        ipcRenderer.send('key-capture:save', capturedAccelerator);
      }
    });

    btnCancel.addEventListener('click', () => {
      ipcRenderer.send('key-capture:cancel');
    });

    btnReset.addEventListener('click', () => {
      ipcRenderer.send('key-capture:reset');
    });

    // Allow Escape to cancel (only if no accelerator captured yet)
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && !capturedAccelerator) {
        ipcRenderer.send('key-capture:cancel');
      }
    });
  </script>
</body>
</html>
  `;
}

export class KeyCaptureWindow {
  private window: BrowserWindow | null = null;
  private resolvePromise: ((result: KeyCaptureResult) => void) | null = null;

  /**
   * Open the key capture dialog and return the captured accelerator
   */
  async capture(currentHotkey: string): Promise<KeyCaptureResult> {
    // Prevent multiple dialogs
    if (this.window) {
      this.window.focus();
      return { success: false, cancelled: true };
    }

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.createWindow(currentHotkey);
      this.setupIpcHandlers();
    });
  }

  private createWindow(currentHotkey: string): void {
    this.window = new BrowserWindow({
      width: 340,
      height: 260,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Load inline HTML
    this.window.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(getDialogHTML(currentHotkey))}`,
    );

    this.window.on('closed', () => {
      this.cleanup();
      if (this.resolvePromise) {
        this.resolvePromise({ success: false, cancelled: true });
        this.resolvePromise = null;
      }
    });
  }

  private setupIpcHandlers(): void {
    // Handle key conversion
    const keydownHandler = (
      event: Electron.IpcMainEvent,
      data: {
        key: string;
        ctrlKey: boolean;
        shiftKey: boolean;
        altKey: boolean;
        metaKey: boolean;
      },
    ) => {
      const accelerator = keyEventToAccelerator(
        data.key,
        data.ctrlKey,
        data.shiftKey,
        data.altKey,
        data.metaKey,
      );
      event.sender.send('key-capture:accelerator', accelerator);
    };

    // Handle save
    const saveHandler = (_event: Electron.IpcMainEvent, accelerator: string) => {
      this.closeWithResult({ success: true, accelerator });
    };

    // Handle cancel
    const cancelHandler = () => {
      this.closeWithResult({ success: false, cancelled: true });
    };

    // Handle reset to default
    const resetHandler = () => {
      this.closeWithResult({ success: true, accelerator: undefined }); // undefined signals reset
    };

    ipcMain.on('key-capture:keydown', keydownHandler);
    ipcMain.once('key-capture:save', saveHandler);
    ipcMain.once('key-capture:cancel', cancelHandler);
    ipcMain.once('key-capture:reset', resetHandler);
  }

  private closeWithResult(result: KeyCaptureResult): void {
    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
    this.cleanup();
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }

  private cleanup(): void {
    ipcMain.removeAllListeners('key-capture:keydown');
    ipcMain.removeAllListeners('key-capture:save');
    ipcMain.removeAllListeners('key-capture:cancel');
    ipcMain.removeAllListeners('key-capture:reset');
  }
}

/**
 * Jotly - Electron Main Process
 *
 * Type less. Say more.
 */

import { exec } from 'node:child_process';
import { app, Notification } from 'electron';
import { BackendManager } from './backend.ts';
import { HotkeyManager } from './hotkey.ts';
import { TrayManager } from './tray.ts';

/**
 * Copy text to system clipboard using xclip
 */
function copyToClipboard(text: string): void {
  const child = exec('xclip -selection clipboard', (error) => {
    if (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  });
  child.stdin?.write(text);
  child.stdin?.end();
}

// Backend API URL
const BACKEND_URL = 'http://127.0.0.1:8765';

// State
let isRecording = false;
let backendManager: BackendManager;
let hotkeyManager: HotkeyManager;
let trayManager: TrayManager;

/**
 * Start recording
 */
async function startRecording(): Promise<void> {
  if (isRecording) return;

  try {
    const response = await fetch(`${BACKEND_URL}/recording/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start recording');
    }

    isRecording = true;
    trayManager.setState('recording');
    console.log('Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    showNotification('Error', 'Failed to start recording');
  }
}

/**
 * Stop recording and transcribe
 */
async function stopRecording(): Promise<void> {
  if (!isRecording) return;

  try {
    trayManager.setState('transcribing');

    const response = await fetch(`${BACKEND_URL}/recording/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'auto' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to stop recording');
    }

    const result = await response.json();
    isRecording = false;
    trayManager.setState('idle');

    if (result.text) {
      // Copy to clipboard using xclip
      console.log('Copying to clipboard:', result.text);
      copyToClipboard(result.text);

      showNotification(
        'Transcribed',
        result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''),
      );
    } else {
      showNotification('No speech detected', 'Try speaking louder or closer to the microphone');
    }
  } catch (error) {
    console.error('Failed to stop recording:', error);
    isRecording = false;
    trayManager.setState('idle');
    showNotification('Error', 'Failed to transcribe audio');
  }
}

/**
 * Toggle recording state
 */
async function toggleRecording(): Promise<void> {
  if (isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
}

/**
 * Show system notification
 */
function showNotification(title: string, body: string): void {
  new Notification({ title, body }).show();
}

/**
 * Initialize the application
 */
async function initialize(): Promise<void> {
  console.log('Initializing Jotly...');

  // Start Python backend
  backendManager = new BackendManager();
  await backendManager.start();

  // Wait for backend to be ready
  const ready = await backendManager.waitForReady();
  if (!ready) {
    console.error('Backend failed to start');
    app.quit();
    return;
  }

  console.log('Backend ready');

  // Create system tray
  trayManager = new TrayManager({
    onToggleRecording: toggleRecording,
    onQuit: () => app.quit(),
  });

  // Register global hotkey
  hotkeyManager = new HotkeyManager({
    onToggle: toggleRecording,
  });
  hotkeyManager.register();

  showNotification('Jotly Ready', 'Press Super+Shift+R to start recording');
}

// App lifecycle
app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('will-quit', () => {
  hotkeyManager?.unregister();
  backendManager?.stop();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

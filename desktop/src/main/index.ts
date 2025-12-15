/**
 * Jotly - Electron Main Process
 *
 * Type less. Say more.
 */

import { exec } from 'node:child_process';
import { app, Notification } from 'electron';
import { BackendManager } from './backend.ts';
import { HotkeyManager } from './hotkey.ts';
import { KeyCaptureWindow } from './key-capture.ts';
import { DEFAULT_HOTKEY, SettingsManager } from './settings.ts';
import { TrayManager } from './tray.ts';

// Enable Wayland GlobalShortcuts portal support BEFORE app.whenReady()
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');

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
let hotkeyManager: HotkeyManager | undefined;
let trayManager: TrayManager;
let settingsManager: SettingsManager;
let keyCaptureWindow: KeyCaptureWindow;

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
 * Handle shortcut change request from tray menu
 */
async function handleChangeShortcut(): Promise<void> {
  if (!hotkeyManager) return;

  if (hotkeyManager.usesPortal()) {
    const ok = await hotkeyManager.configurePortalShortcut();
    if (ok) {
      trayManager.refreshMenu();
      showNotification('Shortcut', 'Choose a shortcut for Jotly in the system dialog.');
    } else {
      showNotification('Shortcut', 'Failed to open the system shortcut dialog.');
    }
    return;
  }

  const currentHotkey = settingsManager.getHotkey();
  const result = await keyCaptureWindow.capture(currentHotkey);

  if (!result.success) {
    // User cancelled
    return;
  }

  // Determine new hotkey (reset to default if accelerator is undefined)
  const newHotkey = result.accelerator ?? DEFAULT_HOTKEY;

  // Try to register the new hotkey
  const success = await hotkeyManager.setAccelerator(newHotkey);

  if (success) {
    // Persist the setting
    settingsManager.setHotkey(newHotkey);

    // Update tray menu to show new hotkey
    trayManager.refreshMenu();

    showNotification('Shortcut Changed', `New shortcut: ${newHotkey}`);
  } else {
    // Failed to register - revert to previous
    await hotkeyManager.setAccelerator(currentHotkey);

    showNotification(
      'Shortcut Change Failed',
      `Could not register "${newHotkey}". It may be in use by another application.`,
    );
  }
}

/**
 * Initialize the application
 */
async function initialize(): Promise<void> {
  console.log('Initializing Jotly...');

  // Initialize settings first
  settingsManager = new SettingsManager();
  keyCaptureWindow = new KeyCaptureWindow();

  // Get saved hotkey (or default)
  const savedHotkey = settingsManager.getHotkey();
  console.log(`Using hotkey: ${savedHotkey}`);

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
    onChangeShortcut: handleChangeShortcut,
    onQuit: () => app.quit(),
    getCurrentHotkey: () => hotkeyManager?.getDisplayHotkey() ?? settingsManager.getHotkey(),
  });

  // Register global hotkey with saved accelerator
  const hk = new HotkeyManager({
    onToggle: toggleRecording,
    accelerator: savedHotkey,
  });
  hotkeyManager = hk;
  const hotkeyRegistered = await hk.register();
  trayManager.refreshMenu();

  if (!hotkeyRegistered) {
    showNotification('Jotly', 'Failed to register global shortcut.');
    return;
  }

  if (hk.usesPortal()) {
    showNotification('Jotly Ready', 'Configure a shortcut for Jotly in the system dialog.');
  } else {
    showNotification('Jotly Ready', `Press ${savedHotkey} to start recording`);
  }
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

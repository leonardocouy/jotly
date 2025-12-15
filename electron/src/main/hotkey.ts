/**
 * Hotkey Manager - Global shortcut registration
 */

import { globalShortcut, app } from 'electron';

// Default hotkey: Super+Shift+R
const DEFAULT_HOTKEY = 'Super+Shift+R';

interface HotkeyManagerOptions {
  onToggle: () => void;
  accelerator?: string;
}

export class HotkeyManager {
  private accelerator: string;
  private onToggle: () => void;
  private registered = false;

  constructor(options: HotkeyManagerOptions) {
    this.onToggle = options.onToggle;
    this.accelerator = options.accelerator || DEFAULT_HOTKEY;

    // Enable Wayland GlobalShortcuts portal support
    app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');
  }

  /**
   * Register the global shortcut
   */
  register(): boolean {
    if (this.registered) {
      return true;
    }

    try {
      const success = globalShortcut.register(this.accelerator, () => {
        console.log(`Hotkey pressed: ${this.accelerator}`);
        this.onToggle();
      });

      if (success) {
        this.registered = true;
        console.log(`Global shortcut registered: ${this.accelerator}`);
      } else {
        console.error(`Failed to register shortcut: ${this.accelerator}`);
      }

      return success;
    } catch (error) {
      console.error('Error registering shortcut:', error);
      return false;
    }
  }

  /**
   * Unregister the global shortcut
   */
  unregister(): void {
    if (!this.registered) return;

    globalShortcut.unregister(this.accelerator);
    this.registered = false;
    console.log(`Global shortcut unregistered: ${this.accelerator}`);
  }

  /**
   * Check if shortcut is registered
   */
  isRegistered(): boolean {
    return globalShortcut.isRegistered(this.accelerator);
  }

  /**
   * Change the hotkey
   */
  setAccelerator(newAccelerator: string): boolean {
    this.unregister();
    this.accelerator = newAccelerator;
    return this.register();
  }
}

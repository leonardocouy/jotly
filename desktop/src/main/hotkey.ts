/**
 * Hotkey Manager - Global shortcut registration
 */

import { globalShortcut } from 'electron';

import { GlobalShortcutsPortal } from './portals/global-shortcuts.ts';

interface HotkeyManagerOptions {
  onToggle: () => void;
  accelerator: string; // Required - provided by SettingsManager
}

export class HotkeyManager {
  private accelerator: string;
  private onToggle: () => void;
  private registered = false;
  private mode: 'electron' | 'portal' = 'electron';
  private portal: GlobalShortcutsPortal | undefined;
  private portalListener: ((id: string) => void) | undefined;

  private readonly portalShortcutId = 'jotly-toggle-recording';
  private readonly portalShortcutDescription = 'Toggle recording (Jotly)';

  constructor(options: HotkeyManagerOptions) {
    this.onToggle = options.onToggle;
    this.accelerator = options.accelerator;
  }

  usesPortal(): boolean {
    return this.mode === 'portal';
  }

  getDisplayHotkey(): string {
    return this.mode === 'portal' ? 'Portal' : this.accelerator;
  }

  /**
   * Get the current accelerator
   */
  getAccelerator(): string {
    return this.accelerator;
  }

  /**
   * Register the global shortcut
   */
  async register(): Promise<boolean> {
    if (this.registered) {
      return true;
    }

    const preferPortal = isWaylandSession();

    if (preferPortal) {
      const portalSuccess = await this.tryRegisterPortal();
      if (portalSuccess) return true;
    }

    const electronSuccess = this.tryRegisterElectron();
    if (electronSuccess) return true;

    const portalFallbackSuccess = await this.tryRegisterPortal();
    return portalFallbackSuccess;
  }

  /**
   * Unregister the global shortcut
   */
  unregister(): void {
    if (!this.registered) return;

    if (this.mode === 'electron') {
      globalShortcut.unregister(this.accelerator);
    } else if (this.portal && this.portalListener) {
      this.portal.removeListener('ShortcutActivated', this.portalListener);
    }

    this.registered = false;
    console.log(`Global shortcut unregistered (${this.mode})`);
  }

  /**
   * Check if shortcut is registered
   */
  isRegistered(): boolean {
    return this.mode === 'electron' ? globalShortcut.isRegistered(this.accelerator) : this.registered;
  }

  /**
   * Change the hotkey
   */
  async setAccelerator(newAccelerator: string): Promise<boolean> {
    if (this.mode === 'portal') {
      return false;
    }

    this.unregister();
    this.accelerator = newAccelerator;
    return this.register();
  }

  async configurePortalShortcut(): Promise<boolean> {
    if (!this.portal) {
      this.portal = new GlobalShortcutsPortal();
    }

    try {
      await this.portal.bindShortcuts([
        { id: this.portalShortcutId, description: this.portalShortcutDescription },
      ]);
      return true;
    } catch (error) {
      console.error('Failed to configure portal shortcut:', error);
      return false;
    }
  }

  private tryRegisterElectron(): boolean {
    try {
      const success = globalShortcut.register(this.accelerator, () => {
        console.log(`Hotkey pressed: ${this.accelerator}`);
        this.onToggle();
      });

      if (success) {
        this.mode = 'electron';
        this.registered = true;
        console.log(`Global shortcut registered (electron): ${this.accelerator}`);
      } else {
        console.error(`Failed to register shortcut (electron): ${this.accelerator}`);
      }

      return success;
    } catch (error) {
      console.error('Error registering shortcut (electron):', error);
      return false;
    }
  }

  private async tryRegisterPortal(): Promise<boolean> {
    if (!this.portal) {
      this.portal = new GlobalShortcutsPortal();
    }

    try {
      const available = await this.portal.isAvailable();
      if (!available) return false;

      await this.portal.bindShortcuts([
        { id: this.portalShortcutId, description: this.portalShortcutDescription },
      ]);

      if (!this.portalListener) {
        this.portalListener = (id: string) => {
          if (id !== this.portalShortcutId) return;
          console.log(`Portal shortcut activated: ${id}`);
          this.onToggle();
        };
        this.portal.on('ShortcutActivated', this.portalListener);
      }

      this.mode = 'portal';
      this.registered = true;
      console.log('Global shortcut registered (portal)');
      return true;
    } catch (error) {
      console.error('Error registering shortcut (portal):', error);
      return false;
    }
  }
}

function isWaylandSession(): boolean {
  return process.env.XDG_SESSION_TYPE === 'wayland' || !!process.env.WAYLAND_DISPLAY;
}

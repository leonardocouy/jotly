/**
 * Settings Manager - Persistent user preferences using electron-store
 */

import Store from 'electron-store';

// Default hotkey matches original behavior
export const DEFAULT_HOTKEY = 'Super+Shift+R';

// Settings interface for type safety
interface JotlySettings {
  hotkey: string;
}

// Schema for validation
const schema = {
  hotkey: {
    type: 'string' as const,
    default: DEFAULT_HOTKEY,
  },
};

export class SettingsManager {
  private store: Store<JotlySettings>;

  constructor() {
    this.store = new Store<JotlySettings>({
      schema,
      name: 'jotly-settings', // Creates ~/.config/jotly/jotly-settings.json
    });
  }

  /**
   * Get the current hotkey accelerator
   */
  getHotkey(): string {
    return this.store.get('hotkey', DEFAULT_HOTKEY);
  }

  /**
   * Set and persist a new hotkey
   */
  setHotkey(accelerator: string): void {
    this.store.set('hotkey', accelerator);
  }

  /**
   * Reset hotkey to default
   */
  resetHotkey(): void {
    this.store.set('hotkey', DEFAULT_HOTKEY);
  }

  /**
   * Check if hotkey is the default
   */
  isDefaultHotkey(): boolean {
    return this.getHotkey() === DEFAULT_HOTKEY;
  }
}

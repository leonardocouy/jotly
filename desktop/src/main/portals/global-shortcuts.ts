/**
 * GlobalShortcuts Portal
 *
 * Implements org.freedesktop.portal.GlobalShortcuts via DBus.
 * Based on Kando's implementation (MIT License).
 *
 * @see https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.GlobalShortcuts.html
 */

import DBus from 'dbus-final';

import { DesktopPortal } from './desktop-portal.ts';

export class GlobalShortcutsPortal extends DesktopPortal {
  private interface: DBus.ClientInterface | undefined;
  private version = 0;
  private session: { token: string; path: string } | undefined;
  private connectPromise: Promise<void> | undefined;

  public async isAvailable(): Promise<boolean> {
    await this.connect();
    return !!this.interface;
  }

  public async getVersion(): Promise<number> {
    await this.connect();
    return this.version;
  }

  public async bindShortcuts(shortcuts: { id: string; description: string }[]): Promise<void> {
    await this.connect();
    const portalInterface = this.interface;
    const session = this.session;
    if (!portalInterface || !session) return;

    await this.makeRequest((request) => {
      portalInterface.BindShortcuts(
        session.path,
        shortcuts.map((shortcut) => [
          shortcut.id,
          { description: new DBus.Variant('s', shortcut.description) },
        ]),
        '',
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          handle_token: new DBus.Variant('s', request.token),
        },
      );
    });
  }

  private async connect(): Promise<void> {
    if (!this.connectPromise) {
      this.connectPromise = this.connectImpl();
    }

    await this.connectPromise;
  }

  private async connectImpl(): Promise<void> {
    try {
      await super.init();

      this.interface = this.portals.getInterface('org.freedesktop.portal.GlobalShortcuts');

      const properties = this.portals.getInterface('org.freedesktop.DBus.Properties');
      const result = await properties.Get('org.freedesktop.portal.GlobalShortcuts', 'version');
      this.version = result.value;

      this.session = this.generateToken('session');
      await this.createSession();

      this.interface.on('Activated', (_handle, id) => {
        this.emit('ShortcutActivated', id);
      });
    } catch (error) {
      this.interface = undefined;
      this.session = undefined;
      this.version = 0;

      console.error('Failed to connect to GlobalShortcuts portal:', error);
    }
  }

  private async createSession(): Promise<DBus.Message> {
    const portalInterface = this.interface;
    const session = this.session;
    if (!portalInterface || !session) {
      throw new Error('GlobalShortcuts portal not connected');
    }

    return this.makeRequest((request) => {
      portalInterface.CreateSession({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        handle_token: new DBus.Variant('s', request.token),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        session_handle_token: new DBus.Variant('s', session.token),
      });
    });
  }
}

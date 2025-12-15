/**
 * Desktop Portal Base Class
 *
 * Base class for XDG Desktop Portal communication via DBus.
 * Based on Kando's implementation (MIT License).
 *
 * @see https://flatpak.github.io/xdg-desktop-portal/
 */

import { EventEmitter } from 'node:events';
import DBus from 'dbus-final';

/**
 * Extended MessageBus type that includes the name property
 */
type NamedMessageBus = {
  name: string;
} & DBus.MessageBus;

/**
 * Base class for all XDG Desktop Portals.
 * Provides common functionality for DBus communication.
 */
export class DesktopPortal extends EventEmitter {
  protected bus = DBus.sessionBus() as NamedMessageBus;
  protected portals!: DBus.ProxyObject;

  /**
   * Initialize connection to the portal.
   * Must be called before using any portal methods.
   */
  protected async init(): Promise<void> {
    this.portals = await this.bus.getProxyObject(
      'org.freedesktop.portal.Desktop',
      '/org/freedesktop/portal/desktop',
    );
  }

  /**
   * Make a portal request and wait for response.
   *
   * Portal methods use a request/response pattern where:
   * 1. A request is made with a handle_token
   * 2. The portal responds via a signal at a predictable path
   *
   * @param method Function that dispatches the actual request
   * @returns Promise resolving to the response message
   * @see https://flatpak.github.io/xdg-desktop-portal/#idm9
   */
  protected async makeRequest(
    method: (request: { token: string; path: string }) => void,
  ): Promise<DBus.Message> {
    return new Promise<DBus.Message>((resolve, reject) => {
      const request = this.generateToken('request');

      const responseListener = (message: DBus.Message) => {
        if (message.path === request.path) {
          if (message.member !== 'Response') {
            reject(new Error(`Unexpected portal response: ${message.member}`));
          }

          this.bus.removeListener('message', responseListener);
          resolve(message);
        }
      };

      this.bus.addListener('message', responseListener);
      method(request);
    });
  }

  /**
   * Generate a unique token and path for portal requests/sessions.
   *
   * @param type Either 'request' or 'session'
   * @returns Object with token and path
   * @see https://flatpak.github.io/xdg-desktop-portal/#gdbus-org.freedesktop.portal.Request
   */
  protected generateToken(type: 'request' | 'session'): { token: string; path: string } {
    const token = `jotly_${Math.floor(Math.random() * 0x100000000)}`;
    const sender = this.bus.name.slice(1).replace(/\./g, '_');
    const path = `/org/freedesktop/portal/desktop/${type}/${sender}/${token}`;

    return { token, path };
  }
}

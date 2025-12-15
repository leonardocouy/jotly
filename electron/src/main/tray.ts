/**
 * Tray Manager - System tray icon and menu
 */

import { Tray, Menu, nativeImage, app } from 'electron';
import * as path from 'path';

type TrayState = 'idle' | 'recording' | 'transcribing';

interface TrayManagerOptions {
  onToggleRecording: () => void;
  onQuit: () => void;
}

export class TrayManager {
  private tray: Tray | null = null;
  private state: TrayState = 'idle';
  private options: TrayManagerOptions;

  constructor(options: TrayManagerOptions) {
    this.options = options;
    this.createTray();
  }

  /**
   * Create the system tray icon
   */
  private createTray(): void {
    // Create a simple icon (in production, use proper icons)
    const icon = this.createIcon();
    this.tray = new Tray(icon);

    this.tray.setToolTip('Jotly - Voice to Text');
    this.updateMenu();

    // Click to toggle recording
    this.tray.on('click', () => {
      this.options.onToggleRecording();
    });
  }

  /**
   * Create icon based on current state
   */
  private createIcon(): Electron.NativeImage {
    // Create a simple 16x16 icon
    // In production, use proper PNG icons from resources/icons/
    const size = 16;
    const canvas = Buffer.alloc(size * size * 4);

    // Fill with color based on state
    let r: number, g: number, b: number;
    switch (this.state) {
      case 'recording':
        r = 255; g = 0; b = 0; // Red
        break;
      case 'transcribing':
        r = 255; g = 165; b = 0; // Orange
        break;
      default:
        r = 100; g = 100; b = 100; // Gray
    }

    // Create a circle
    const center = size / 2;
    const radius = size / 2 - 1;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const offset = (y * size + x) * 4;
        if (distance <= radius) {
          canvas[offset] = r;     // R
          canvas[offset + 1] = g; // G
          canvas[offset + 2] = b; // B
          canvas[offset + 3] = 255; // A
        } else {
          canvas[offset + 3] = 0; // Transparent
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, {
      width: size,
      height: size,
    });
  }

  /**
   * Update the context menu
   */
  private updateMenu(): void {
    if (!this.tray) return;

    const statusLabel = {
      idle: 'Ready (Super+Shift+R)',
      recording: 'Recording...',
      transcribing: 'Transcribing...',
    };

    const menu = Menu.buildFromTemplate([
      {
        label: `Jotly - ${statusLabel[this.state]}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: this.state === 'recording' ? 'Stop Recording' : 'Start Recording',
        click: () => this.options.onToggleRecording(),
        enabled: this.state !== 'transcribing',
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.options.onQuit(),
      },
    ]);

    this.tray.setContextMenu(menu);
  }

  /**
   * Set the tray state
   */
  setState(state: TrayState): void {
    this.state = state;
    if (this.tray) {
      this.tray.setImage(this.createIcon());
      this.updateMenu();

      // Update tooltip
      const tooltips = {
        idle: 'Jotly - Ready',
        recording: 'Jotly - Recording...',
        transcribing: 'Jotly - Transcribing...',
      };
      this.tray.setToolTip(tooltips[state]);
    }
  }

  /**
   * Destroy the tray
   */
  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

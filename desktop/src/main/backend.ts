/**
 * Backend Manager - Manages the Python FastAPI process
 */

import { spawn, type ChildProcess } from 'node:child_process';
import * as path from 'node:path';

import { app } from 'electron';

const BACKEND_URL = 'http://127.0.0.1:8765';
const HEALTH_CHECK_TIMEOUT = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 500; // 500ms

export class BackendManager {
  private process: ChildProcess | null = null;

  /**
   * Start the Python backend process
   */
  async start(): Promise<void> {
    if (this.process) {
      console.log('Backend already running');
      return;
    }

    // Get the backend directory path
    const backendDir = this.getBackendDir();
    console.log('Starting backend from:', backendDir);

    // Spawn Python process
    // Use 'uv run' if available, otherwise fall back to 'python'
    this.process = spawn(
      'uv',
      ['run', 'uvicorn', 'src.main:app', '--host', '127.0.0.1', '--port', '8765'],
      {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      },
    );

    // Log stdout
    this.process.stdout?.on('data', (data) => {
      console.log(`[backend] ${data.toString().trim()}`);
    });

    // Log stderr
    this.process.stderr?.on('data', (data) => {
      console.error(`[backend] ${data.toString().trim()}`);
    });

    // Handle process exit
    this.process.on('exit', (code) => {
      console.log(`Backend process exited with code ${code}`);
      this.process = null;
    });

    this.process.on('error', (err) => {
      console.error('Failed to start backend:', err);
      this.process = null;
    });
  }

  /**
   * Stop the backend process
   */
  stop(): void {
    if (!this.process) return;

    console.log('Stopping backend...');
    this.process.kill('SIGTERM');
    this.process = null;
  }

  /**
   * Wait for the backend to be ready
   */
  async waitForReady(): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (response.ok) {
          return true;
        }
      } catch {
        // Backend not ready yet
      }

      await this.sleep(HEALTH_CHECK_INTERVAL);
    }

    return false;
  }

  /**
   * Check if backend is running
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the backend directory path
   */
  private getBackendDir(): string {
    // In development, backend is in ../backend relative to electron
    // In production, it would be bundled differently
    const isDev = !app.isPackaged;

    if (isDev) {
      // Development: relative to project root
      return path.join(__dirname, '..', '..', '..', '..', 'backend');
    }

    // Production: bundled with app
    return path.join(process.resourcesPath, 'backend');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

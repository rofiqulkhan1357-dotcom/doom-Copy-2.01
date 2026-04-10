/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SerialService {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private encoder = new TextEncoder();
  private lastSentAngles: Map<number, number> = new Map();

  async connect(): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported in this browser.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.writer = this.port.writable.getWriter();
      return true;
    } catch (error) {
      console.error('Failed to connect to serial port:', error);
      return false;
    }
  }

  async disconnect() {
    this.lastSentAngles.clear();
    if (this.writer) {
      await this.writer.releaseLock();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }

  async sendServoAngle(id: number, angle: number) {
    if (!this.writer) return;
    
    const roundedAngle = Math.round(angle);
    if (this.lastSentAngles.get(id) === roundedAngle) return;
    
    const message = `S${id}:${roundedAngle}\n`;
    const data = this.encoder.encode(message);
    
    try {
      await this.writer.write(data);
      this.lastSentAngles.set(id, roundedAngle);
    } catch (error) {
      console.error('Failed to write to serial port:', error);
    }
  }

  isConnected(): boolean {
    return this.port !== null;
  }
}

export const serialService = new SerialService();

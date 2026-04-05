// ============================================================================
// Message Bus — puente entre el handler y la web chat (WebSocket)
// ============================================================================

import { EventEmitter } from 'events';
import type { VisionRiskLevel, VisionAnalysis } from '../types.js';

export interface OutboundMessage {
  phone: string;
  text: string;
  timestamp: string;
}

// ── SRP Vision events ───────────────────────────────────────────────────────

export interface VisionFrameEvent {
  sessionId: string;
  frameId: string;
  frameNumber: number;
  imagePath: string;
  timestamp: string;
}

export interface VisionInstructionEvent {
  sessionId: string;
  source: 'ai' | 'senior' | 'technician';
  content: string;
  audioUrl: string | null;
  riskLevel: VisionRiskLevel;
  timestamp: string;
}

export interface VisionAlertEvent {
  sessionId: string;
  riskLevel: VisionRiskLevel;
  message: string;
  analysis: VisionAnalysis;
  timestamp: string;
}

// ── Bus tipado ──────────────────────────────────────────────────────────────

class MessageBus extends EventEmitter {
  emit(event: 'outbound', msg: OutboundMessage): boolean;
  emit(event: 'vision:frame', msg: VisionFrameEvent): boolean;
  emit(event: 'vision:instruction', msg: VisionInstructionEvent): boolean;
  emit(event: 'vision:alert', msg: VisionAlertEvent): boolean;
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'outbound', listener: (msg: OutboundMessage) => void): this;
  on(event: 'vision:frame', listener: (msg: VisionFrameEvent) => void): this;
  on(event: 'vision:instruction', listener: (msg: VisionInstructionEvent) => void): this;
  on(event: 'vision:alert', listener: (msg: VisionAlertEvent) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export const messageBus = new MessageBus();

/** Se llama desde wasender.ts para distribuir mensajes salientes */
export function emitOutbound(phone: string, text: string): void {
  messageBus.emit('outbound', { phone, text, timestamp: new Date().toISOString() });
}

// ============================================================================
// Message Bus — puente entre el handler y la web chat (WebSocket)
// ============================================================================

import { EventEmitter } from 'events';

export interface OutboundMessage {
  phone: string;
  text: string;
  timestamp: string;
}

class MessageBus extends EventEmitter {
  /** Emitido cuando el sistema quiere enviar un mensaje a un teléfono */
  emit(event: 'outbound', msg: OutboundMessage): boolean;
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'outbound', listener: (msg: OutboundMessage) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export const messageBus = new MessageBus();

/** Se llama desde wasender.ts para distribuir mensajes salientes */
export function emitOutbound(phone: string, text: string): void {
  messageBus.emit('outbound', { phone, text, timestamp: new Date().toISOString() });
}

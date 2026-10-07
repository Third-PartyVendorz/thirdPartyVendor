import { Injectable, signal } from '@angular/core';

export type MessageType = 'error' | 'success' | 'info';

export interface AppMessage {
  type: MessageType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly message = signal<AppMessage | null>(null);

  setMessage(text: string, type: MessageType = 'info') {
    this.message.set({ type, text });
  }

  setErrorMessage(text: string) {
    this.setMessage(text, 'error');
  }

  setSuccessMessage(text: string) {
    this.setMessage(text, 'success');
  }

  clearMessage() {
    this.message.set(null);
  }
}
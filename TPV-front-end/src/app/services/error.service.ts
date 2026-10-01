import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  readonly errorMessage = signal<string | null>(null);

  setErrorMessage(message: string) {
    this.errorMessage.set(message);
  }

  clearErrorMessage() {
    this.errorMessage.set(null);
  }
}
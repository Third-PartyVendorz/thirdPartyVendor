import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-frozen-account-modal',
  templateUrl: './frozen-account-modal.html',
  styleUrl: './frozen-account-modal.scss',
})
export class FrozenAccountModal {
  @Input() action = 'complete this action';
  @Output() dismissed = new EventEmitter<void>();

  close(): void {
    this.dismissed.emit();
  }
}

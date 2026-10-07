import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeFormComponent } from '../trade-form/trade-form.component';
import { AssetTradeDetails } from '../../asset-result/asset-result';

@Component({
  selector: 'app-trade-modal',
  standalone: true,
  imports: [CommonModule, TradeFormComponent],
  templateUrl: './trade-modal.component.html',
  styleUrl: './trade-modal.component.scss',
})
export class TradeModalComponent {
  @Input() isOpen = false;
  @Input() ticker = '';
  @Input() assetDetails: AssetTradeDetails | null = null;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  onBackdropClick() {
    this.close();
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CashHoldingResponse } from '../../dto/CashHoldingResponse';
import { TradeService } from '../../trade-page/trade.service';

@Component({
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  selector: 'app-forex-holdings',
  styleUrl: './forex-holdings.scss',
  templateUrl: './forex-holdings.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForexHoldings implements OnInit {
  holdings: CashHoldingResponse[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly tradeService: TradeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tradeService.getCashHoldings().subscribe({
      next: (holdings) => {
        this.holdings = holdings;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error retrieving forex holdings:', error);
        this.errorMessage = 'Unable to load your forex holdings.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}

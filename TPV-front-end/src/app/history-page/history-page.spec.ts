import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { OrderResponse } from '../dto/OrderResponse';
import { MessageService } from '../services/message.service';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../shared/order-status';
import { TradeSide } from '../shared/trade-side';
import { TradeService } from '../trade-page/trade.service';
import { HistoryPage } from './history-page';

describe('HistoryPage', () => {
  let component: HistoryPage;
  let fixture: ComponentFixture<HistoryPage>;

  const orders: OrderResponse[] = [
    {
      orderId: 1,
      ticker: 'VOD',
      orderIntent: TradeSide.BUY,
      quantity: 1,
      orderPrice: 12.34,
      executionPrice: 12.34,
      executionQuantity: 1,
      status: OrderStatus.FILLED,
      createdAt: '2026-10-26T10:00:00',
      orderCurrency: 'GBP',
    },
    {
      orderId: 2,
      ticker: '7203',
      orderIntent: TradeSide.BUY,
      quantity: 1,
      orderPrice: 2500,
      executionPrice: 2500,
      executionQuantity: 1,
      status: OrderStatus.FILLED,
      createdAt: '2026-10-25T10:00:00',
      orderCurrency: 'JPY',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryPage],
      providers: [
        { provide: OrderService, useValue: { fetchOrders: () => of(orders) } },
        { provide: TradeService, useValue: { getRecentCashTransactions: () => of([]) } },
        {
          provide: MessageService,
          useValue: { setErrorMessage: () => {}, setSuccessMessage: () => {} },
        },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('formats each order using its own currency', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows[0].textContent).toContain('£12.34');
    expect(rows[1].textContent).toContain('¥2,500');
  });

  it('formats cash transactions using their currency code', () => {
    expect(
      component.formatCashTransactionAmount({
        transactionId: 1,
        currencyCode: 'GBP',
        type: 'DEPOSIT',
        amount: 12.34,
        createdAt: '2026-10-26T10:00:00',
      }),
    ).toBe('+£12.34');
  });
});

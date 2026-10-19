import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AssetTradeDetails } from '../../asset-result/asset-result';
import { OrderResponse } from '../../dto/OrderResponse';
import { OrderStatus } from '../../shared/order-status';
import { TradeSide } from '../../shared/trade-side';
import { TradeService } from '../trade.service';
import { TradeFormComponent } from './trade-form.component';

describe('TradeFormComponent', () => {
  let component: TradeFormComponent;
  let fixture: ComponentFixture<TradeFormComponent>;
  let tradeService: {
    getCashHoldingByCurrencyCode: ReturnType<typeof vi.fn>;
    getQuantitySharesOwned: ReturnType<typeof vi.fn>;
    postOrder: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const assetDetails: AssetTradeDetails = {
    symbol: 'AAPL',
    asset: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'STOCK',
      exchange: 'NASDAQ',
      currency: 'USD',
      active: true,
    },
    quote: {
      symbol: 'AAPL',
      price: 100,
      bid: 99.9,
      ask: 100.1,
      spreadBps: 20,
      currency: 'USD',
      change: 1,
      changePercent: 1,
      previousClose: 99,
      asOf: '2026-10-19T12:00:00Z',
      marketState: 'OPEN',
    },
  };

  const orderResponse: OrderResponse = {
    orderId: 1,
    ticker: 'AAPL',
    orderIntent: TradeSide.BUY,
    quantity: 2,
    orderPrice: null,
    executionPrice: 101,
    executionQuantity: 2,
    status: OrderStatus.EXECUTED,
    createdAt: '2026-10-19T12:00:00Z',
    orderCurrency: 'USD',
  };

  beforeEach(async () => {
    tradeService = {
      getCashHoldingByCurrencyCode: vi.fn(() => of({ balance: 1_000 })),
      getQuantitySharesOwned: vi.fn(() => of({ numShares: 5 })),
      postOrder: vi.fn(() => of(orderResponse)),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TradeFormComponent],
      providers: [
        { provide: TradeService, useValue: tradeService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeFormComponent);
    component = fixture.componentInstance;
    component.ticker = 'AAPL';
    component.assetDetails = assetDetails;
    fixture.detectChanges();
  });

  it('loads buying power and owned shares when initialized', () => {
    expect(tradeService.getCashHoldingByCurrencyCode).toHaveBeenCalledWith('USD');
    expect(tradeService.getQuantitySharesOwned).toHaveBeenCalledWith('AAPL');
    expect(component.buyingPower).toBe(1_000);
    expect(component.sharesOwned).toBe(5);
    expect(component.hasCurrency).toBe(true);
  });

  it('calculates shares and estimated total from a share quantity', () => {
    component.form.get('inputValue')?.setValue('2.5');

    expect(component.calculatedShares).toBe(2.5);
    expect(component.formattedShares).toBe('2.5');
    expect(component.estimatedTotal).toBe(250);
  });

  it('calculates shares from a dollar amount', () => {
    component.currentUnit = component.UnitType.DOLLARS;
    component.form.get('inputValue')?.setValue('250');

    expect(component.calculatedShares).toBe(2.5);
    expect(component.estimatedTotal).toBe(250);
  });

  it('rejects buy orders that exceed buying power', () => {
    component.form.get('inputValue')?.setValue('10');
    component.buyingPower = 500;

    expect(component.hasInsufficientFunds).toBe(true);
    expect(component.isInvalidTrade()).toBe(true);
  });

  it('rejects sell orders that exceed owned shares', () => {
    component.currentSide = TradeSide.SELL;
    component.form.get('inputValue')?.setValue('6');

    expect(component.hasInsufficientShares).toBe(true);
    expect(component.isInvalidTrade()).toBe(true);
  });

  it('opens the order summary for a valid trade', () => {
    const summaryToggled = vi.spyOn(component.summaryToggled, 'emit');
    component.form.get('inputValue')?.setValue('2');

    component.onContinueToOrderSummary();

    expect(component.showOrderSummaryPanel).toBe(true);
    expect(component.buyingPowerAtOrderSummaryOpen).toBe(1_000);
    expect(component.sharedOwnedAtOrderSummaryOpen).toBe(5);
    expect(summaryToggled).toHaveBeenCalledWith(true);
  });

  it('submits a share-based order and stores the execution response', () => {
    component.form.get('inputValue')?.setValue('2');

    component.submitOrder();

    expect(tradeService.postOrder).toHaveBeenCalledWith({
      ticker: 'AAPL',
      orderIntent: TradeSide.BUY,
      quantity: 2,
      orderCurrency: 'USD',
    });
    expect(component.orderSubmitted).toBe(true);
    expect(component.isSubmittingOrder).toBe(false);
    expect(component.submittedOrderResponse).toEqual(orderResponse);
    expect(component.executedTotal).toBe(202);
  });

  it('submits a dollar-based order with an order price', () => {
    component.currentUnit = component.UnitType.DOLLARS;
    component.form.get('inputValue')?.setValue('250');

    component.submitOrder();

    expect(tradeService.postOrder).toHaveBeenCalledWith({
      ticker: 'AAPL',
      orderIntent: TradeSide.BUY,
      orderPrice: 250,
      orderCurrency: 'USD',
    });
  });

  it('navigates to funding and forex from the currency banner actions', () => {
    component.navigateToFunding();
    component.navigateToForex();

    expect(router.navigate).toHaveBeenNthCalledWith(1, ['/funding']);
    expect(router.navigate).toHaveBeenNthCalledWith(2, ['/forex'], {
      queryParams: { from: 'USD', to: 'USD' },
    });
  });
});
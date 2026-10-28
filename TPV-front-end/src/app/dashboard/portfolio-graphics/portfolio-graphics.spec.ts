import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { OrderResponse } from '../../dto/OrderResponse';
import { MarketApiService } from '../../services/marketApi.service';
import { OrderService } from '../../services/order.service';
import { OrderStatus } from '../../shared/order-status';
import { TradeSide } from '../../shared/trade-side';
import { Holding } from '../holdings-table/holding.model';
import { PortfolioGraphics } from './portfolio-graphics';

describe('PortfolioGraphics', () => {
  let component: PortfolioGraphics;
  let fixture: ComponentFixture<PortfolioGraphics>;
  let marketApi: { fetchForexQuote: ReturnType<typeof vi.fn> };
  let orderService: { fetchOrders: ReturnType<typeof vi.fn> };

  const holding = (overrides: Partial<Holding> = {}): Holding => ({
    ticker: 'AAPL', userId: 1, security: 'Apple', assetType: 'STOCK',
    numShares: 2, currency: 'USD', marketValue: 400, ...overrides,
  });
  const order = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
    orderId: 1, ticker: 'AAPL', orderIntent: TradeSide.BUY,
    quantity: 999, orderPrice: 999, executionPrice: 100, executionQuantity: 3,
    status: OrderStatus.FILLED, createdAt: '2026-10-01T12:00:00Z',
    orderCurrency: 'USD', ...overrides,
  });

  beforeEach(async () => {
    marketApi = { fetchForexQuote: vi.fn(() => of({ data: { price: 1.1 } })) };
    orderService = { fetchOrders: vi.fn(() => of([] as OrderResponse[])) };
    await TestBed.configureTestingModule({
      imports: [PortfolioGraphics],
      providers: [
        { provide: MarketApiService, useValue: marketApi },
        { provide: OrderService, useValue: orderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioGraphics);
    component = fixture.componentInstance;
  });

  it('shows empty states without inventing allocation or history', () => {
    fixture.detectChanges();
    expect(component.allocations()).toEqual([]);
    expect(component.trend()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No holdings to display yet');
    expect(fixture.nativeElement.textContent).toContain('No filled orders yet');
    expect(fixture.nativeElement.querySelectorAll('svg')).toHaveLength(0);
  });

  it('groups security types by USD market value rather than share count', () => {
    fixture.componentRef.setInput('holdings', [
      holding(), holding({ assetType: 'equity', marketValue: 200 }),
      holding({ assetType: 'CRYPTO', numShares: 0.001, marketValue: 200 }),
      holding({ assetType: 'mutual_fund', marketValue: 200 }),
    ]);
    fixture.detectChanges();
    expect(component.totalValue()).toBe(1000);
    expect(component.allocations().map(item => [item.label, item.percentage])).toEqual([
      ['Equities', 60], ['Crypto', 20], ['Mutual funds', 20],
    ]);
    expect(fixture.nativeElement.querySelectorAll('.pie-chart path')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.allocation-legend').textContent).toContain('60.0%');
  });

  it('draws a complete circle for one category and ignores closed positions', () => {
    fixture.componentRef.setInput('holdings', [holding(), holding({ numShares: 0, marketValue: undefined })]);
    fixture.detectChanges();
    expect(component.allocations()).toHaveLength(1);
    expect(component.allocations()[0].percentage).toBe(100);
    expect(component.allocations()[0].path.match(/A /g)).toHaveLength(2);
  });

  it('uses Other for unknown types and updates when holdings change', () => {
    fixture.componentRef.setInput('holdings', [holding({ assetType: 'UNKNOWN' })]);
    fixture.detectChanges();
    expect(component.allocations()[0].label).toBe('Other');
    fixture.componentRef.setInput('holdings', [holding({ assetType: 'ETF', marketValue: 500 })]);
    fixture.detectChanges();
    expect(component.allocations()[0].label).toBe('ETFs');
    expect(component.totalValue()).toBe(500);
  });

  it('converts holdings and orders to USD, reusing currency quotes', () => {
    fixture.componentRef.setInput('holdings', [holding({ currency: ' eur ' }), holding({ currency: 'EUR' })]);
    orderService.fetchOrders.mockReturnValue(of([order({ orderCurrency: 'EUR' })]));
    fixture.detectChanges();
    expect(component.totalValue()).toBeCloseTo(880);
    expect(component.netInvestment()).toBeCloseTo(330);
    expect(marketApi.fetchForexQuote).toHaveBeenCalledExactlyOnceWith('EUR', 'USD');
  });

  it.each([undefined, NaN, -10])('does not present a partial allocation for invalid value %s', marketValue => {
    fixture.componentRef.setInput('holdings', [holding(), holding({ marketValue })]);
    fixture.detectChanges();
    expect(component.allocationError()).toBeTruthy();
    expect(component.allocations()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.pie-chart')).toBeNull();
  });

  it('handles FX errors independently from the investment chart and recovers on updated holdings', () => {
    marketApi.fetchForexQuote.mockReturnValue(throwError(() => new Error('FX failed')));
    fixture.componentRef.setInput('holdings', [holding({ currency: 'EUR' })]);
    orderService.fetchOrders.mockReturnValue(of([order()]));
    fixture.detectChanges();
    expect(component.allocationError()).toBeTruthy();
    expect(component.netInvestment()).toBe(300);
    fixture.componentRef.setInput('holdings', [holding()]);
    fixture.detectChanges();
    expect(component.allocationError()).toBeNull();
    expect(component.totalValue()).toBe(400);
  });

  it('honors parent loading and error states', () => {
    fixture.componentRef.setInput('holdingsLoading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading allocation');
    fixture.componentRef.setInput('holdingsLoading', false);
    fixture.componentRef.setInput('holdingsError', 'Holdings failed');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Holdings failed');
  });

  it('sorts and groups filled executions by UTC date, subtracting sells and ignoring unfilled orders', () => {
    orderService.fetchOrders.mockReturnValue(of([
      order({ createdAt: '2026-10-03T08:00:00Z', orderIntent: TradeSide.SELL, executionQuantity: 1 }),
      order(), order({ createdAt: '2026-10-01T13:00:00Z', executionQuantity: 2 }),
      order({ status: OrderStatus.PENDING, executionPrice: null }),
      order({ status: OrderStatus.CANCELLED, executionQuantity: null }),
    ]));
    fixture.detectChanges();
    expect(component.investmentPoints().map(point => point.value)).toEqual([500, 400]);
    expect(component.netInvestment()).toBe(400);
    expect(component.trend()!.line).toContain('H 624 V');
    expect(fixture.nativeElement.textContent).toContain('Not historical portfolio value');
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('spaces points by actual elapsed time and supports negative net investment', () => {
    orderService.fetchOrders.mockReturnValue(of([
      order(), order({ createdAt: '2026-10-02T12:00:00Z' }),
      order({ createdAt: '2026-10-11T12:00:00Z', orderIntent: TradeSide.SELL, executionQuantity: 10 }),
    ]));
    fixture.detectChanges();
    expect(component.trend()!.dots[1].x).toBeCloseTo(76.8);
    expect(component.netInvestment()).toBe(-400);
    expect(component.trend()!.ticks.at(-1)!.value).toBeLessThan(-400);
  });

  it('renders a visible point for a single day and finite coordinates for zero net investment', () => {
    orderService.fetchOrders.mockReturnValue(of([order(), order({ orderIntent: TradeSide.SELL })]));
    fixture.detectChanges();
    expect(component.trend()!.dots).toHaveLength(1);
    expect(component.trend()!.dots[0].x).toBe(320);
    expect(component.trend()!.line).not.toMatch(/NaN|Infinity/);
    expect(fixture.nativeElement.querySelectorAll('.trend-chart circle')).toHaveLength(1);
  });

  it('shows loading until orders arrive', () => {
    const orders = new Subject<OrderResponse[]>();
    orderService.fetchOrders.mockReturnValue(orders);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading investment history');
    orders.next([order()]);
    fixture.detectChanges();
    expect(component.investmentLoading()).toBe(false);
    expect(component.netInvestment()).toBe(300);
  });

  it.each([
    { executionPrice: null }, { executionQuantity: null }, { createdAt: 'invalid' }, { orderCurrency: '' },
  ])('rejects incomplete filled orders instead of falling back to requested values: %s', overrides => {
    orderService.fetchOrders.mockReturnValue(of([order(overrides)]));
    fixture.detectChanges();
    expect(component.investmentError()).toBeTruthy();
    expect(component.trend()).toBeNull();
  });

  it('does not fabricate a trend when orders fail', () => {
    orderService.fetchOrders.mockReturnValue(throwError(() => new Error('Orders failed')));
    fixture.detectChanges();
    expect(component.investmentError()).toBeTruthy();
    expect(component.investmentLoading()).toBe(false);
    expect(component.trend()).toBeNull();
  });
});

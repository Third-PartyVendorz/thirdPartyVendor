import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { CashHoldingResponse } from '../../dto/CashHoldingResponse';
import { MarketApiService } from '../../services/marketApi.service';
import { TradeService } from '../../trade-page/trade.service';
import { Holding } from '../holdings-table/holding.model';
import { PortfolioSummary } from './portfolio-summary';

describe('PortfolioSummary', () => {
  let component: PortfolioSummary;
  let fixture: ComponentFixture<PortfolioSummary>;
  let tradeService: { getCashHoldings: ReturnType<typeof vi.fn> };
  let marketApiService: { fetchForexQuote: ReturnType<typeof vi.fn> };

  function holding(overrides: Partial<Holding> = {}): Holding {
    return {
      ticker: 'AAPL', userId: 1, security: 'Apple', assetType: 'STOCK',
      numShares: 2, currency: 'USD', marketValue: 400, ...overrides,
    };
  }

  beforeEach(async () => {
    tradeService = { getCashHoldings: vi.fn(() => of([] as CashHoldingResponse[])) };
    marketApiService = { fetchForexQuote: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [PortfolioSummary],
      providers: [
        { provide: TradeService, useValue: tradeService },
        { provide: MarketApiService, useValue: marketApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioSummary);
    component = fixture.componentInstance;
  });

  it('returns zero for no cash holdings without fetching exchange rates', () => {
    fixture.detectChanges();

    expect(component.cashBalance()).toBe(0);
    expect(component.buyingPower()).toBe(0);
    expect(component.isLoading()).toBe(false);
    expect(marketApiService.fetchForexQuote).not.toHaveBeenCalled();
  });

  it('uses USD balances and buying power separately without conversion', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
    ]));
    fixture.detectChanges();

    expect(component.cashBalance()).toBe(1000);
    expect(component.buyingPower()).toBe(700);
    expect(marketApiService.fetchForexQuote).not.toHaveBeenCalled();
  });

  it('converts every holding to USD and reuses rates for duplicate currencies', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
      { currencyCode: 'EUR', balance: 100, buyingPower: 80 },
      { currencyCode: ' eur ', balance: 50, buyingPower: 40 },
      { currencyCode: 'JPY', balance: 10000, buyingPower: 9000 },
    ]));
    marketApiService.fetchForexQuote.mockImplementation((currency: string) =>
      of({ data: { price: currency === 'EUR' ? 1.1 : 0.007 } })
    );
    fixture.detectChanges();

    expect(component.cashBalance()).toBeCloseTo(1235);
    expect(component.buyingPower()).toBeCloseTo(895);
    expect(marketApiService.fetchForexQuote).toHaveBeenCalledTimes(2);
    expect(marketApiService.fetchForexQuote).toHaveBeenCalledWith('EUR', 'USD');
    expect(marketApiService.fetchForexQuote).toHaveBeenCalledWith('JPY', 'USD');
    const values = fixture.nativeElement.querySelectorAll('.metric .small-value');
    expect(values[0].textContent.trim()).toBe('$895.00');
    expect(values[1].textContent.trim()).toBe('$1,235.00');
  });

  it('supports portfolios without USD and keeps precision until display', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'EUR', balance: 0.01, buyingPower: 0.01 },
      { currencyCode: 'EUR', balance: 0.01, buyingPower: 0.01 },
    ]));
    marketApiService.fetchForexQuote.mockReturnValue(of({ data: { price: 1.4 } }));
    fixture.detectChanges();

    expect(component.cashBalance()).toBeCloseTo(0.028);
    expect(component.buyingPower()).toBeCloseTo(0.028);
    expect(fixture.nativeElement.textContent).toContain('$0.03');
  });

  it('shows loading while cash holdings are pending', () => {
    const holdings = new Subject<CashHoldingResponse[]>();
    tradeService.getCashHoldings.mockReturnValue(holdings);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Loading…');
    holdings.next([]);
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  it('shows unavailable when cash holdings cannot be fetched', () => {
    tradeService.getCashHoldings.mockReturnValue(throwError(() => new Error('Cash API failed')));
    fixture.detectChanges();

    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Unavailable');
  });

  it('does not display a partial total when an FX quote fails', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
      { currencyCode: 'EUR', balance: 100, buyingPower: 80 },
    ]));
    marketApiService.fetchForexQuote.mockReturnValue(throwError(() => new Error('FX API failed')));
    fixture.detectChanges();

    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
    const values = fixture.nativeElement.querySelectorAll('.metric .small-value');
    expect(values[0].textContent.trim()).toBe('Unavailable');
    expect(values[1].textContent.trim()).toBe('Unavailable');
  });

  it('uses security market value only, excluding cash, buying power and cost basis', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
    ]));
    fixture.componentRef.setInput('holdings', [holding({ costBasis: 300 })]);
    fixture.detectChanges();

    expect(component.portfolioValue).toBe(400);
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('$400.00');
    expect(marketApiService.fetchForexQuote).not.toHaveBeenCalled();
  });

  it('converts securities and cash using the same cached USD rate', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'EUR', balance: 100, buyingPower: 80 },
    ]));
    marketApiService.fetchForexQuote.mockReturnValue(of({ data: { price: 1.1 } }));
    fixture.componentRef.setInput('holdings', [
      holding(), holding({ ticker: 'SAP', currency: 'EUR', marketValue: 200 }),
    ]);
    fixture.detectChanges();

    expect(component.portfolioValue).toBeCloseTo(620);
    expect(marketApiService.fetchForexQuote).toHaveBeenCalledTimes(1);
  });

  it('supports cash-only portfolios and updates when holdings arrive or are removed', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
    ]));
    fixture.detectChanges();
    expect(component.portfolioValue).toBe(0);

    fixture.componentRef.setInput('holdings', [holding()]);
    fixture.detectChanges();
    expect(component.portfolioValue).toBe(400);

    fixture.componentRef.setInput('holdings', []);
    fixture.detectChanges();
    expect(component.portfolioValue).toBe(0);
  });

  it('displays holdings value even when cash cannot be fetched', () => {
    tradeService.getCashHoldings.mockReturnValue(throwError(() => new Error('Cash API failed')));
    fixture.componentRef.setInput('holdings', [holding({ change: 5 })]);
    fixture.detectChanges();

    expect(component.errorMessage()).toBeTruthy();
    expect(component.portfolioValue).toBe(400);
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('$400.00');
    expect(component.dailyGainLoss).toBe(5);
  });

  it('displays holdings value without waiting for cash', () => {
    tradeService.getCashHoldings.mockReturnValue(new Subject<CashHoldingResponse[]>());
    fixture.componentRef.setInput('holdings', [holding({ change: 5 })]);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('$400.00');
    expect(component.dailyGainLoss).toBe(5);
  });

  it('waits for the dashboard holdings request before displaying total value', () => {
    fixture.componentRef.setInput('holdingsLoading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('Loading…');

    fixture.componentRef.setInput('holdingsLoading', false);
    fixture.componentRef.setInput('holdingsError', 'Holdings failed');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('Unavailable');
  });

  it('rejects missing prices and recovers on the next holdings update', () => {
    fixture.componentRef.setInput('holdings', [holding({ marketValue: undefined })]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('Unavailable');

    fixture.componentRef.setInput('holdings', [holding()]);
    fixture.detectChanges();
    expect(component.securitiesError()).toBeNull();
    expect(component.portfolioValue).toBe(400);
  });

  it('does not display a partial portfolio value when security FX fails', () => {
    marketApiService.fetchForexQuote.mockReturnValue(throwError(() => new Error('FX failed')));
    fixture.componentRef.setInput('holdings', [holding({ currency: 'EUR' })]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.value').textContent.trim()).toBe('Unavailable');
    expect(component.errorMessage()).toBeNull();
    expect(component.cashBalance()).toBe(0);
  });

  it('sums holding daily changes without multiplying by shares and excludes cash', () => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'USD', balance: 1000, buyingPower: 700 },
    ]));
    fixture.componentRef.setInput('holdings', [holding({ change: 5 })]);
    fixture.detectChanges();

    expect(component.dailyGainLoss).toBe(5);
    expect(component.dailyGainLossPercentage).toBeCloseTo(5 / 395 * 100);
    const daily = fixture.nativeElement.querySelector('.portfolio-daily-change');
    expect(daily.textContent).toContain('$5.00');
    expect(daily.textContent).toContain('+1.27%');
    expect(daily.classList.contains('positive')).toBe(true);
  });

  it('converts and sums daily changes across currencies and updates after holdings change', () => {
    marketApiService.fetchForexQuote.mockReturnValue(of({ data: { price: 1.1 } }));
    fixture.componentRef.setInput('holdings', [
      holding({ change: 5 }),
      holding({ ticker: 'SAP', currency: 'EUR', marketValue: 200, change: -10, numShares: 3 }),
    ]);
    fixture.detectChanges();

    expect(component.dailyGainLoss).toBeCloseTo(-6);
    expect(component.dailyGainLossPercentage).toBeCloseTo(-6 / 626 * 100);
    expect(fixture.nativeElement.querySelector('.portfolio-daily-change').classList.contains('negative')).toBe(true);

    fixture.componentRef.setInput('holdings', [holding({ change: 0 })]);
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBe(0);
    expect(component.dailyGainLossPercentage).toBe(0);
  });

  it('shows zero daily gains for an empty portfolio', () => {
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBe(0);
    expect(component.dailyGainLossPercentage).toBe(0);
    const daily = fixture.nativeElement.querySelector('.portfolio-daily-change');
    expect(daily.textContent).toContain('$0.00');
    expect(daily.textContent).not.toContain('▼');
  });

  it('does not invent a daily gain when a quote change is missing', () => {
    fixture.componentRef.setInput('holdings', [holding()]);
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBeNull();
    expect(component.dailyGainLossPercentage).toBeNull();
    expect(component.portfolioValue).toBe(400);
    expect(fixture.nativeElement.querySelector('.portfolio-daily-change').textContent).toContain('Unavailable');
  });

  it('does not divide by a zero prior portfolio value', () => {
    fixture.componentRef.setInput('holdings', [holding({ marketValue: 10, numShares: 1, change: 10 })]);
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBe(10);
    expect(component.dailyGainLossPercentage).toBeNull();
    expect(fixture.nativeElement.querySelector('.portfolio-daily-change').textContent).toContain('(N/A)');
  });

  it('hides daily gains while holdings load or fail', () => {
    fixture.componentRef.setInput('holdings', [holding({ change: 5 })]);
    fixture.componentRef.setInput('holdingsLoading', true);
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBeNull();
    expect(fixture.nativeElement.querySelector('.portfolio-daily-change').textContent).toContain('Loading…');

    fixture.componentRef.setInput('holdingsLoading', false);
    fixture.componentRef.setInput('holdingsError', 'Failed');
    fixture.detectChanges();
    expect(component.dailyGainLoss).toBeNull();
    expect(fixture.nativeElement.querySelector('.portfolio-daily-change').textContent).toContain('Unavailable');
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid exchange rate %s', (price) => {
    tradeService.getCashHoldings.mockReturnValue(of([
      { currencyCode: 'EUR', balance: 100, buyingPower: 80 },
    ]));
    marketApiService.fetchForexQuote.mockReturnValue(of({ data: { price } }));
    fixture.detectChanges();

    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Unavailable');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { CashHoldingResponse } from '../../dto/CashHoldingResponse';
import { MarketApiService } from '../../services/marketApi.service';
import { TradeService } from '../../trade-page/trade.service';
import { PortfolioSummary } from './portfolio-summary';

describe('PortfolioSummary', () => {
  let component: PortfolioSummary;
  let fixture: ComponentFixture<PortfolioSummary>;
  let tradeService: { getCashHoldings: ReturnType<typeof vi.fn> };
  let marketApiService: { fetchForexQuote: ReturnType<typeof vi.fn> };

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

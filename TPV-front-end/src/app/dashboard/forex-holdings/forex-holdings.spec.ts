import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForexHoldings } from './forex-holdings';
import { environment } from '../../../environments/environment.local';

describe('ForexHoldings', () => {
  let fixture: ComponentFixture<ForexHoldings>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForexHoldings],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ForexHoldings);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('displays the user currency balances', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/cashHoldings`);
    request.flush([
      { currencyCode: 'EUR', balance: 125.5 },
      { currencyCode: 'JPY', balance: 10000 },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('EUR');
    expect(fixture.nativeElement.textContent).toContain('125.5');
    expect(fixture.nativeElement.textContent).toContain('JPY');
  });

  it('shows an error when balances cannot be loaded', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/cashHoldings`);
    request.flush('Request failed', {
      status: 500,
      statusText: 'Server Error',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load your forex holdings.');
  });
});

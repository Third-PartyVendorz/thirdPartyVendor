import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment.local';
import { WatchlistService } from './watchlist.service';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let httpTestingController: HttpTestingController;
  const watchlistUrl = `${environment.apiBaseUrl}/watchlist`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(WatchlistService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets the authenticated user watchlist', () => {
    let watchlist: string[] | undefined;

    service.getWatchlist().subscribe((response) => {
      watchlist = response;
    });

    const request = httpTestingController.expectOne(watchlistUrl);
    expect(request.request.method).toBe('GET');
    request.flush(['AAPL', 'TSLA']);

    expect(watchlist).toEqual(['AAPL', 'TSLA']);
  });

  it('adds a ticker to the watchlist', () => {
    let watchlist: string[] | undefined;

    service.addToWatchlist('AAPL').subscribe((response) => {
      watchlist = response;
    });

    const request = httpTestingController.expectOne(watchlistUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ticker: 'AAPL' });
    request.flush(['AAPL']);

    expect(watchlist).toEqual(['AAPL']);
  });

  it('removes multiple tickers from the watchlist', () => {
    let watchlist: string[] | undefined;

    service.removeFromWatchlist(['AAPL', 'TSLA']).subscribe((response) => {
      watchlist = response;
    });

    const request = httpTestingController.expectOne(watchlistUrl);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ tickers: ['AAPL', 'TSLA'] });
    request.flush([]);

    expect(watchlist).toEqual([]);
  });
});
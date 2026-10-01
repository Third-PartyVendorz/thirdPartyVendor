import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './AuthInterceptor';
import { ErrorService } from './services/error.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let errorService: ErrorService;

  beforeEach(() => {
    localStorage.clear();
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);
    errorService.clearErrorMessage();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    errorService.clearErrorMessage();
    vi.restoreAllMocks();
  });

  it('should clear token and redirect to login on 401', () => {
    localStorage.setItem('authToken', 'fake-token');

    httpClient.get('/secure-resource').subscribe({
      error: () => undefined,
    });

    const request = httpTestingController.expectOne('/secure-resource');
    expect(request.request.headers.get('Authorization')).toBe('Bearer fake-token');

    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(errorService.errorMessage()).toBeNull();
  });

  it('should set a shared error message on 403', () => {
    localStorage.setItem('authToken', 'fake-token');

    httpClient.get('/secure-resource').subscribe({
      error: () => undefined,
    });

    const request = httpTestingController.expectOne('/secure-resource');
    request.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('authToken')).toBe('fake-token');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(errorService.errorMessage()).toBe('You do not have permission to access this resource.');
  });
});
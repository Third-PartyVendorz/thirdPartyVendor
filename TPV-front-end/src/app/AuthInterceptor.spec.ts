import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './AuthInterceptor';
import { MessageService } from './services/message.service';
import { environment } from '../../environments/environment.local';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let messageService: MessageService;

  beforeEach(() => {
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
    messageService = TestBed.inject(MessageService);
    messageService.clearMessage();
  });

  afterEach(() => {
    httpTestingController.verify();
    messageService.clearMessage();
    vi.restoreAllMocks();
  });

  it('should send credentialed API requests and redirect on 401', () => {
    httpClient.get(`${environment.apiBaseUrl}/secure-resource`).subscribe({
      error: () => undefined,
    });

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/secure-resource`);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(messageService.message()).toEqual({
      type: 'error',
      text: 'Your session has expired. Please log in again.',
    });
  });

  it('should set a shared error message on 403', () => {
    httpClient.get(`${environment.apiBaseUrl}/secure-resource`).subscribe({
      error: () => undefined,
    });

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/secure-resource`);
    request.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(messageService.message()).toEqual({
      type: 'error',
      text: 'You do not have permission to access this resource.',
    });
  });
});
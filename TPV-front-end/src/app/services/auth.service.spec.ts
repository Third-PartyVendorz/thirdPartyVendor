import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.local';
import { AuthService } from './auth.service';
import { UserContextService } from './user-context.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let userContextService: { clearUserContext: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = {
      navigateByUrl: vi.fn(),
    };
    userContextService = {
      clearUserContext: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: UserContextService, useValue: userContextService },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.restoreAllMocks();
  });

  it('authenticates and marks the session as authenticated', () => {
    let responseEmail: string | undefined;

    service.authenticate({ email: 'jane.doe@example.com', password: 'secret123' }).subscribe((response) => {
      responseEmail = response.email;
    });

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/auth/authenticate`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      userId: 42,
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '555-0102',
      dateOfBirth: '1992-08-22',
      email: 'jane.doe@example.com',
    });

    expect(responseEmail).toBe('jane.doe@example.com');
    expect(service.getSessionState()).toBe(true);
  });

  it('logs out, clears user context, and expires the session', () => {
    service.markSessionAuthenticated();

    service.logout().subscribe();

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);

    request.flush(null);

    expect(service.getSessionState()).toBe(false);
    expect(userContextService.clearUserContext).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('refreshes the session when refresh succeeds', () => {
    service.markSessionExpired();

    service.refreshToken().subscribe();

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);

    request.flush(null);

    expect(service.getSessionState()).toBe(true);
  });

  it('returns true and marks the session authenticated when checkSession succeeds', () => {
    let sessionIsValid = false;

    service.checkSession().subscribe((value) => {
      sessionIsValid = value;
    });

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/auth/me`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);

    request.flush(null);

    expect(sessionIsValid).toBe(true);
    expect(service.getSessionState()).toBe(true);
  });

  it('returns false when checkSession fails', () => {
    service.markSessionAuthenticated();

    let sessionIsValid: boolean | undefined;

    service.checkSession().subscribe((value) => {
      sessionIsValid = value;
    });

    const request = httpTestingController.expectOne(`${environment.apiBaseUrl}/auth/me`);
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(sessionIsValid).toBe(false);
    expect(service.getSessionState()).toBe(true);
  });
});
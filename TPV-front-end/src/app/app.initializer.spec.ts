import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { validateSessionOnStartup } from './app.initializer';
import { AuthService } from './services/auth.service';

describe('validateSessionOnStartup', () => {
  let authService: { checkSession: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      checkSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('bypasses session validation on the login route', () => {
    window.history.pushState({}, '', '/login');

    const result$ = TestBed.runInInjectionContext(() => validateSessionOnStartup());
    let emittedValue: boolean | undefined;

    result$.subscribe((value) => {
      emittedValue = value;
    });

    expect(emittedValue).toBe(false);
    expect(authService.checkSession).not.toHaveBeenCalled();
  });

  it('validates the session on non-login routes', () => {
    authService.checkSession.mockReturnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() => validateSessionOnStartup());
    let emittedValue: boolean | undefined;

    result$.subscribe((value) => {
      emittedValue = value;
    });

    expect(authService.checkSession).toHaveBeenCalledTimes(1);
    expect(emittedValue).toBe(true);
  });

  it('returns false when session validation fails', () => {
    authService.checkSession.mockReturnValue(throwError(() => new Error('boom')));

    const result$ = TestBed.runInInjectionContext(() => validateSessionOnStartup());
    let emittedValue: boolean | undefined;

    result$.subscribe((value) => {
      emittedValue = value;
    });

    expect(authService.checkSession).toHaveBeenCalledTimes(1);
    expect(emittedValue).toBe(false);
  });
});
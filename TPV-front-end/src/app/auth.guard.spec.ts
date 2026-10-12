import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';

describe('authGuard', () => {
  let authService: {
    getSessionState: ReturnType<typeof vi.fn>;
    markSessionExpired: ReturnType<typeof vi.fn>;
  };
  let router: { parseUrl: ReturnType<typeof vi.fn> };
  let messageService: MessageService;

  beforeEach(() => {
    authService = {
      getSessionState: vi.fn(),
      markSessionExpired: vi.fn(),
    };
    router = {
      parseUrl: vi.fn(() => '/login'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    messageService = TestBed.inject(MessageService);
    messageService.clearMessage();
  });

  afterEach(() => {
    messageService.clearMessage();
    vi.restoreAllMocks();
  });

  it('allows navigation when the session is already authenticated', () => {
    authService.getSessionState.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(authService.markSessionExpired).not.toHaveBeenCalled();
    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(messageService.message()).toBeNull();
  });

  it('redirects to login when the session is not authenticated', () => {
    authService.getSessionState.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(authService.markSessionExpired).toHaveBeenCalledTimes(1);
    expect(messageService.message()).toEqual({
      type: 'error',
      text: 'You must be signed in to access that page.',
    });
    expect(router.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe('/login');
  });
});
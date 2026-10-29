import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { UserContextService } from '../services/user-context.service';
import { LoginContainer } from './login-container';

describe('LoginContainer', () => {
  let component: LoginContainer;
  let fixture: ComponentFixture<LoginContainer>;
  let registerResult: Subject<RegisterResponse>;
  let register: ReturnType<typeof vi.fn>;
  let setErrorMessage: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    registerResult = new Subject<RegisterResponse>();
    register = vi.fn(() => registerResult.asObservable());
    setErrorMessage = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginContainer],
      providers: [
        { provide: AuthService, useValue: { register, authenticate: vi.fn() } },
        { provide: MessageService, useValue: { setSuccessMessage: vi.fn(), setErrorMessage } },
        { provide: UserContextService, useValue: { setUserContext: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switches to the login panel after registration succeeds', () => {
    component.showRegister();
    const request: RegisterRequest = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      phoneNumber: '555-0100',
      dateOfBirth: new Date('1815-12-10'),
      email: 'ada@example.com',
      password: 'test-password',
    };
    component.register(request);

    registerResult.next({} as RegisterResponse);

    expect(register).toHaveBeenCalledTimes(1);
    expect(component.activeTab()).toBe('login');
  });

  it('shows a confirmation password field on the registration form', () => {
    component.showRegister();
    fixture.detectChanges();

    const confirmationInput = fixture.nativeElement.querySelector('#confirm-password') as HTMLInputElement;

    expect(confirmationInput).toBeTruthy();
    expect(confirmationInput.required).toBe(true);
  });

  it('does not submit registration when passwords do not match', () => {
    component.showRegister();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    (form.elements.namedItem('password') as HTMLInputElement).value = 'first-password';
    (form.elements.namedItem('confirmPassword') as HTMLInputElement).value = 'different-password';

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(register).not.toHaveBeenCalled();
    expect(setErrorMessage).toHaveBeenCalledWith('Passwords do not match.');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminUser } from '../../dto/AdminUser';
import { AdminService } from '../../services/admin.service';
import { MessageService } from '../../services/message.service';
import { UserContextService } from '../../services/user-context.service';
import { AdminUsersPage } from './admin-users-page';

describe('AdminUsersPage', () => {
  let fixture: ComponentFixture<AdminUsersPage>;
  let adminService: {
    getUsers: ReturnType<typeof vi.fn>;
    freezeUser: ReturnType<typeof vi.fn>;
    unfreezeUser: ReturnType<typeof vi.fn>;
  };
  let messageService: { setErrorMessage: ReturnType<typeof vi.fn> };
  const user: AdminUser = {
    userId: 42,
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: '555-0102',
    dateOfBirth: '1992-08-22',
    email: 'jane.doe@example.com',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    frozen: false,
    active: true,
  };

  beforeEach(async () => {
    adminService = {
      getUsers: vi.fn().mockReturnValue(of([user])),
      freezeUser: vi.fn(),
      unfreezeUser: vi.fn(),
    };
    messageService = { setErrorMessage: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: MessageService, useValue: messageService },
        { provide: UserContextService, useValue: { getUserContext: () => ({ userId: 1 }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersPage);
  });

  it.each([
    { active: true, frozen: false, status: 'Active', modifier: null, disabled: false },
    { active: true, frozen: true, status: 'Frozen', modifier: 'status--frozen', disabled: false },
    { active: false, frozen: false, status: 'Deleted', modifier: 'status--deleted', disabled: true },
    { active: false, frozen: true, status: 'Deleted', modifier: 'status--deleted', disabled: true },
  ])('shows $status for active=$active and frozen=$frozen', async ({
    active, frozen, status, modifier, disabled,
  }) => {
    adminService.getUsers.mockReturnValue(of([{ ...user, active, frozen }]));
    fixture.detectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const badge = element.querySelector('.status');
    const button = element.querySelector<HTMLButtonElement>('.freeze-action');
    expect(badge?.textContent?.trim()).toBe(status);
    expect(badge?.classList.contains('status--deleted')).toBe(modifier === 'status--deleted');
    expect(badge?.classList.contains('status--frozen')).toBe(modifier === 'status--frozen');
    expect(button?.disabled).toBe(disabled);
    expect(button?.textContent?.trim()).toBe(frozen ? 'Unfreeze' : 'Freeze account');
  });

  it('updates the displayed status when a deleted account is fetched on refresh', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.status')?.textContent?.trim()).toBe('Active');

    adminService.getUsers.mockReturnValue(of([{ ...user, active: false }]));
    element.querySelector<HTMLButtonElement>('.secondary-action')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(adminService.getUsers).toHaveBeenCalledTimes(2);
    expect(element.querySelector('.status')?.textContent?.trim()).toBe('Deleted');
    expect(element.querySelector<HTMLButtonElement>('.freeze-action')?.disabled).toBe(true);
  });

  it.each([false, true])('rejects access changes to a deleted account with frozen=%s', (frozen) => {
    fixture.componentInstance.toggleFreeze({ ...user, active: false, frozen });

    expect(adminService.freezeUser).not.toHaveBeenCalled();
    expect(adminService.unfreezeUser).not.toHaveBeenCalled();
    expect(messageService.setErrorMessage).toHaveBeenCalledWith(
      'Deleted accounts cannot be frozen or unfrozen.',
    );
  });
});

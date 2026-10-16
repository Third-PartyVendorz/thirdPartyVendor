import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminUser } from '../../dto/AdminUser';
import { AdminService } from '../../services/admin.service';
import { MessageService } from '../../services/message.service';
import { UserContextService } from '../../services/user-context.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-users-page',
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.scss',
})
export class AdminUsersPage implements OnInit {
  users: AdminUser[] = [];
  searchTerm = '';
  isLoading = false;
  updatingUserId: number | null = null;

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private userContextService: UserContextService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): AdminUser[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query
      ? this.users.filter((user) =>
          `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(query),
        )
      : this.users;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().pipe(finalize(() => {
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    })).subscribe({
      next: (users) => {
        this.users = users;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to load users.'),
    });
  }

  toggleFreeze(user: AdminUser): void {
    if (user.userId === this.userContextService.getUserContext()?.userId) {
      this.messageService.setErrorMessage('You cannot freeze your own administrator account.');
      return;
    }

    const request = user.frozen
      ? this.adminService.unfreezeUser(user.userId)
      : this.adminService.freezeUser(user.userId);
    this.updatingUserId = user.userId;
    request.pipe(finalize(() => this.updatingUserId = null)).subscribe({
      next: () => {
        const newStatus = user.frozen ? 'active' : 'frozen';
        this.messageService.setSuccessMessage(`${user.firstName} ${user.lastName} is now ${newStatus}.`);
        window.location.reload();
      },
      error: (error) => this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to update this account.'),
    });
  }
}

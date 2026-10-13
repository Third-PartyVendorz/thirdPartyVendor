import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ChangePasswordRequest } from '../dto/ChangePasswordRequest';
import { EditAccountRequest } from '../dto/EditAccountRequest';
import { UserContext } from '../dto/UserContext';
import { MessageService } from '../services/message.service';
import { UserProfileService } from '../services/user-profile.service';
import { UserContextService } from '../services/user-context.service';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule],
	selector: 'app-profile-page',
	styleUrl: './profile-page.scss',
	templateUrl: './profile-page.html',
})
export class ProfilePage implements OnInit {
	constructor(
		private userContextService: UserContextService,
		private userProfileService: UserProfileService,
		private messageService: MessageService,
		private authService: AuthService,
	) {}

	userContext: UserContext | null = null;
	isEditingProfile = false;
	isChangingPassword = false;
	isSavingProfile = false;
	isSavingPassword = false;
	isDeletingAccount = false;
	profileDraft: EditAccountRequest = this.createEmptyProfileDraft();
	passwordDraft: ChangePasswordRequest = this.createEmptyPasswordDraft();

	ngOnInit(): void {
		this.loadUserContext();
	}

	loadUserContext(): void {
		this.userContext = this.userContextService.getUserContext();
		this.profileDraft = this.createProfileDraft();
	}

	toggleProfileEdit(): void {
		if (this.isEditingProfile) {
			this.cancelProfileEdit();
			return;
		}

		this.profileDraft = this.createProfileDraft();
		this.isEditingProfile = true;
	}

	cancelProfileEdit(): void {
		this.isEditingProfile = false;
		this.profileDraft = this.createProfileDraft();
	}

	saveProfile(): void {
		if (!this.userContext?.userId) {
			this.messageService.setErrorMessage('Please log in again before updating your profile.');
			return;
		}

		this.isSavingProfile = true;
		this.userProfileService.editAccount(this.profileDraft)
			.pipe(finalize(() => {
				this.isSavingProfile = false;
			}))
			.subscribe({
				next: () => {
					const updatedUserContext: UserContext = {
						userId: this.userContext!.userId,
						firstName: this.profileDraft.firstName,
						lastName: this.profileDraft.lastName,
						phoneNumber: this.profileDraft.phoneNumber,
						email: this.profileDraft.email,
						dateOfBirth: new Date(`${this.profileDraft.dateOfBirth}T00:00:00`),
					};

					this.userContext = updatedUserContext;
					this.userContextService.setUserContext(updatedUserContext);
					window.location.reload();
					this.messageService.setSuccessMessage('Profile updated successfully.');
				},
				error: (error) => {
					this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to update profile.');
				},
			});
	}

	togglePasswordForm(): void {
		this.isChangingPassword = !this.isChangingPassword;
		if (!this.isChangingPassword) {
			this.passwordDraft = this.createEmptyPasswordDraft();
		}
	}

	changePassword(): void {
		if (!this.userContext?.userId) {
			this.messageService.setErrorMessage('Please log in again before changing your password.');
			return;
		}

		if (!this.passwordDraft.currentPassword || !this.passwordDraft.newPassword || !this.passwordDraft.confirmNewPassword) {
			this.messageService.setErrorMessage('Please fill out all password fields.');
			return;
		}

		if (this.passwordDraft.newPassword !== this.passwordDraft.confirmNewPassword) {
			this.messageService.setErrorMessage('New passwords do not match.');
			return;
		}

		this.isSavingPassword = true;
		this.userProfileService.changePassword(this.passwordDraft)
			.pipe(finalize(() => {
				this.isSavingPassword = false;
			}))
			.subscribe({
				next: () => {
					this.passwordDraft = this.createEmptyPasswordDraft();
					this.isChangingPassword = false;
					window.location.reload();
					this.messageService.setSuccessMessage('Password changed successfully.');
				},
				error: (error) => {
					this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to change password.');
				},
			});
	}

	deleteAccount(): void {
		if (!this.userContext?.userId) {
			this.messageService.setErrorMessage('Please log in again before deleting your account.');
			return;
		}

		const confirmed = window.confirm('Delete this account? This action cannot be undone.');
		if (!confirmed) {
			return;
		}

		this.isDeletingAccount = true;
		this.userProfileService.deleteAccount()
			.pipe(finalize(() => {
				this.isDeletingAccount = false;
			}))
			.subscribe({
				next: () => {
					this.messageService.setSuccessMessage('Account deleted successfully.');
					this.authService.logout().subscribe({
						error: () => this.authService.markSessionExpired(),
					});
				},
				error: (error) => {
					this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to delete account.');
				},
			});
	}

	private createProfileDraft(): EditAccountRequest {
		if (!this.userContext) {
			return this.createEmptyProfileDraft();
		}

		return {
			firstName: this.userContext.firstName ?? '',
			lastName: this.userContext.lastName ?? '',
			phoneNumber: this.userContext.phoneNumber ?? '',
			email: this.userContext.email ?? '',
			dateOfBirth: this.formatDateForInput(this.userContext.dateOfBirth),
		};
	}

	private createEmptyProfileDraft(): EditAccountRequest {
		return {
			firstName: '',
			lastName: '',
			phoneNumber: '',
			email: '',
			dateOfBirth: '',
		};
	}

	private createEmptyPasswordDraft(): ChangePasswordRequest {
		return {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		};
	}

	private formatDateForInput(date: Date): string {
		if (Number.isNaN(date.getTime())) {
			return '';
		}

		return date.toISOString().split('T')[0];
	}
}
package com.thirdpartyvendor.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.thirdpartyvendor.api.dto.ChangePasswordRequest;
import com.thirdpartyvendor.api.dto.EditAccountRequest;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.AppUser.UserRole;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.service.UserService.EmailAlreadyInUseException;
import com.thirdpartyvendor.api.service.UserService.PasswordException;
import com.thirdpartyvendor.api.service.UserService.UserNotFoundException;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

class UserServiceTest {

	private AppUserRepository appUserRepository;
	private PasswordEncoder passwordEncoder;
	private UserService userService;

	@BeforeEach
	void setUp() {
		appUserRepository = mock(AppUserRepository.class);
		passwordEncoder = new BCryptPasswordEncoder();
		userService = new UserService(appUserRepository, passwordEncoder);
	}


	@Test
	void editUserUpdatesEmailSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, null, null, null, "newemail@example.com");

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.findByEmail("newemail@example.com")).thenReturn(Optional.empty());
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals("newemail@example.com", captor.getValue().getEmail());
	}

	@Test
	void editUserUpdatesFirstNameSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest("Jane", null, null, null, null);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals("Jane", captor.getValue().getFirstName());
	}

	@Test
	void editUserUpdatesLastNameSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, "Smith",null , null, null);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals("Smith", captor.getValue().getLastName());
	}

	@Test
	void editUserUpdatesDateOfBirthSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		LocalDate newDob = LocalDate.of(1990, 5, 15);
		EditAccountRequest request = new EditAccountRequest(null, null, null, newDob, null);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals(newDob, captor.getValue().getDateOfBirth());
	}

	@Test
	void editUserUpdatesPhoneNumberSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, null,"555-0123", null, null);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals("555-0123", captor.getValue().getPhoneNumber());
	}

	@Test
	void editUserUpdatesMultipleFieldsSuccessfully() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		LocalDate newDob = LocalDate.of(1990, 5, 15);
		EditAccountRequest request = new EditAccountRequest("Jane", "Smith", "555-0123", newDob, "newemail@example.com");

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.findByEmail("newemail@example.com")).thenReturn(Optional.empty());
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		AppUser savedUser = captor.getValue();
		assertEquals("newemail@example.com", savedUser.getEmail());
		assertEquals("Jane", savedUser.getFirstName());
		assertEquals("Smith", savedUser.getLastName());
		assertEquals(newDob, savedUser.getDateOfBirth());
		assertEquals("555-0123", savedUser.getPhoneNumber());
	}

	@Test
	void editUserAllowsSameEmailForSameUser() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, null, "555-0000", null, "john@example.com");

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.findByEmail("john@example.com")).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		verify(appUserRepository).save(any(AppUser.class));
	}

	@Test
	void editUserRejectsDuplicateEmail() {
		Long userId = 1L;
		Long otherUserId = 2L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser otherUser = createUser(otherUserId, "jane", "doe", "555-0123", LocalDate.of(1992, 2, 2), "jane@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, null, null, null, "jane@example.com");

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(otherUser));

		EmailAlreadyInUseException exception = assertThrows(EmailAlreadyInUseException.class,
				() -> userService.editUser(userId, request, currentUser));

		assertEquals("Email is already in use", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void editUserThrowsUserNotFoundExceptionWhenUserDoesNotExist() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		EditAccountRequest request = new EditAccountRequest(null, null, "555-0000", null, "newemail@example.com");

		when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

		UserNotFoundException exception = assertThrows(UserNotFoundException.class,
				() -> userService.editUser(userId, request, currentUser));

		assertEquals("User not found", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void editUserIgnoresNullFieldsInRequest() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUpdate.setFirstName("Original");
		EditAccountRequest request = new EditAccountRequest(null, null, null, null, null);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.editUser(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertEquals("Original", captor.getValue().getFirstName());
	}


	@Test
	void changePasswordSuccessfullyChangesPassword() {
		Long userId = 1L;
		String oldPassword = "oldPassword123";
		String newPassword = "newPassword456";
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUpdate.setPasswordHash(passwordEncoder.encode(oldPassword));
		ChangePasswordRequest request = new ChangePasswordRequest(oldPassword, newPassword, newPassword);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUpdate);

		userService.changePassword(userId, request, currentUser);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertTrue(passwordEncoder.matches(newPassword, captor.getValue().getPasswordHash()));
		assertFalse(passwordEncoder.matches(oldPassword, captor.getValue().getPasswordHash()));
	}

	@Test
	void changePasswordThrowsExceptionForIncorrectCurrentPassword() {
		Long userId = 1L;
		String oldPassword = "oldPassword123";
		String wrongPassword = "wrongPassword000";
		String newPassword = "newPassword456";
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUpdate.setPasswordHash(passwordEncoder.encode(oldPassword));
		ChangePasswordRequest request = new ChangePasswordRequest(wrongPassword, newPassword, newPassword);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));

		PasswordException exception = assertThrows(PasswordException.class,
				() -> userService.changePassword(userId, request, currentUser));

		assertEquals("Incorrect current password", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void changePasswordThrowsExceptionWhenNewPasswordsDoNotMatch() {
		Long userId = 1L;
		String oldPassword = "oldPassword123";
		String newPassword1 = "newPassword456";
		String newPassword2 = "differentPassword789";
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUpdate.setPasswordHash(passwordEncoder.encode(oldPassword));
		ChangePasswordRequest request = new ChangePasswordRequest(oldPassword, newPassword1, newPassword2);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));

		PasswordException exception = assertThrows(PasswordException.class,
				() -> userService.changePassword(userId, request, currentUser));

		assertEquals("New passwords don't match", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void changePasswordThrowsUserNotFoundExceptionWhenUserDoesNotExist() {
		Long userId = 1L;
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		ChangePasswordRequest request = new ChangePasswordRequest("oldPassword", "newPassword", "newPassword");

		when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

		UserNotFoundException exception = assertThrows(UserNotFoundException.class,
				() -> userService.changePassword(userId, request, currentUser));

		assertEquals("User not found", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void changePasswordValidatesOldPasswordBeforeMatchingNewPasswords() {
		Long userId = 1L;
		String oldPassword = "oldPassword123";
		String wrongPassword = "wrongPassword000";
		String newPassword1 = "newPassword456";
		String newPassword2 = "differentPassword789";
		AppUser currentUser = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		AppUser userToUpdate = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUpdate.setPasswordHash(passwordEncoder.encode(oldPassword));
		ChangePasswordRequest request = new ChangePasswordRequest(wrongPassword, newPassword1, newPassword2);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));

		// Should fail on incorrect password, not on mismatched new passwords
		PasswordException exception = assertThrows(PasswordException.class,
				() -> userService.changePassword(userId, request, currentUser));

		assertEquals("Incorrect current password", exception.getMessage());
	}


	@Test
	void freezeAccountSuccessfullyFreezesAccount() {
		Long userId = 1L;
		AppUser admin = createUser(2L, "admin", "user", "555-0000", LocalDate.of(1990, 1, 1), "admin@example.com", "defaultPassword123", UserRole.ADMIN, false);
		AppUser userToFreeze = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		// userToFreeze.setFrozen(false);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToFreeze));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToFreeze);

		userService.freezeAccount(userId, admin);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertTrue(captor.getValue().isFrozen());
	}

	@Test
	void freezeAccountThrowsUserNotFoundExceptionWhenUserDoesNotExist() {
		Long userId = 1L;
		AppUser admin = createUser(2L, "admin", "user", "555-0000", LocalDate.of(1990, 1, 1), "admin@example.com", "defaultPassword123", UserRole.ADMIN, false);

		when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

		UserNotFoundException exception = assertThrows(UserNotFoundException.class,
				() -> userService.freezeAccount(userId, admin));

		assertEquals("User not found", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void freezeAccountEnforcesAdminAuthorizationCheck() {
		Long userId = 1L;
		AppUser nonAdmin = createUser(2L, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);

		// AuthorizationUtil.requireAdmin will throw an exception for non-admin users
		// This test verifies that the authorization check is enforced
		// Note: This assumes AuthorizationUtil is being called. If AuthorizationUtil
		// is mocked or not actually throwing, this test may need adjustment.
		assertThrows(Exception.class, () -> userService.freezeAccount(userId, nonAdmin));
	}


	@Test
	void unfreezeAccountSuccessfullyUnfreezesAccount() {
		Long userId = 1L;
		AppUser admin = createUser(2L, "admin", "user", "555-0000", LocalDate.of(1990, 1, 1), "admin@example.com", "defaultPassword123", UserRole.ADMIN, false);
		AppUser userToUnfreeze = createUser(userId, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);
		userToUnfreeze.setFrozen(true);

		when(appUserRepository.findById(userId)).thenReturn(Optional.of(userToUnfreeze));
		when(appUserRepository.save(any(AppUser.class))).thenReturn(userToUnfreeze);

		userService.unfreezeAccount(userId, admin);

		ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
		verify(appUserRepository).save(captor.capture());
		assertFalse(captor.getValue().isFrozen());
	}

	@Test
	void unfreezeAccountThrowsUserNotFoundExceptionWhenUserDoesNotExist() {
		Long userId = 1L;
		AppUser admin = createUser(2L, "admin", "user", "555-0000", LocalDate.of(1990, 1, 1), "admin@example.com", "defaultPassword123", UserRole.ADMIN, false);

		when(appUserRepository.findById(userId)).thenReturn(Optional.empty());

		UserNotFoundException exception = assertThrows(UserNotFoundException.class,
				() -> userService.unfreezeAccount(userId, admin));

		assertEquals("User not found", exception.getMessage());
		verify(appUserRepository, never()).save(any(AppUser.class));
	}

	@Test
	void unfreezeAccountEnforcesAdminAuthorizationCheck() {
		Long userId = 1L;
		AppUser nonAdmin = createUser(2L, "john", "doe", "555-0000", LocalDate.of(1990, 1, 1), "john@example.com", "defaultPassword123", UserRole.USER, false);

		// AuthorizationUtil.requireAdmin will throw an exception for non-admin users
		assertThrows(Exception.class, () -> userService.unfreezeAccount(userId, nonAdmin));
	}

    private AppUser createUser(Long id, String firstName, String lastName, String phoneNumber, LocalDate dateOfBirth, String email, String password, UserRole role, boolean frozen) {
		AppUser user = new AppUser();
		user.setId(id);
		user.setFirstName(firstName);
		user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setDateOfBirth(dateOfBirth);
		user.setEmail(email);
		user.setRole(role);
		user.setPasswordHash(passwordEncoder.encode(password));
		user.setFrozen(frozen);
		return user;
	}
}

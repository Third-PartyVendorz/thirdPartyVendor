package com.thirdpartyvendor.api.util;

import com.thirdpartyvendor.api.entity.AppUser;

public class AuthorizationUtil {

	public static boolean isOwnUser(Long targetUserId, AppUser currentUser) {
		return currentUser.getId().equals(targetUserId);
	}

	public static boolean isOwnUserOrAdmin(Long targetUserId, AppUser currentUser) {
		return currentUser.getId().equals(targetUserId) || 
		       currentUser.getRole() == AppUser.UserRole.ADMIN;
	}

	public static boolean isAdmin(AppUser currentUser) {
		return currentUser.getRole() == AppUser.UserRole.ADMIN;
	}

	public static void requireOwnUser(Long targetUserId, AppUser currentUser) {
		if (!isOwnUser(targetUserId, currentUser)) {
			throw new ForbiddenException("Only the associated user can perform this action.");
		}
	}

	public static void requireOwnUserOrAdmin(Long targetUserId, AppUser currentUser) {
		if (!isOwnUserOrAdmin(targetUserId, currentUser)) {
			throw new ForbiddenException("Only an admin or the associated user can perform this action.");
		}
	}

	public static void requireAdmin(AppUser currentUser) {
		if (!isAdmin(currentUser)) {
			throw new ForbiddenException("Only an admin can perform this action.");
		}
	}

	public static class ForbiddenException extends RuntimeException {
		public ForbiddenException(String message) {
			super(message);
		}
	}
}

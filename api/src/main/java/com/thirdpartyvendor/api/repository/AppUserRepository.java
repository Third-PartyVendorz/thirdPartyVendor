package com.thirdpartyvendor.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import com.thirdpartyvendor.api.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

	Optional<AppUser> findByEmail(String email);

	Optional<AppUser> findByEmailAndActiveTrue(String email);

	@Query("select u from AppUser u where locate(lower(:search), lower(concat(concat(u.firstName, ' '), u.lastName))) > 0 or locate(lower(:search), lower(u.email)) > 0")
	Page<AppUser> searchAuditClients(@Param("search") String search, Pageable pageable);
}
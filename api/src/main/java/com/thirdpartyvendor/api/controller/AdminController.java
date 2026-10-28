package com.thirdpartyvendor.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import com.thirdpartyvendor.api.dto.AuditClientResponse;
import com.thirdpartyvendor.api.dto.AuditPageResponse;

import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.service.UserService;
import com.thirdpartyvendor.api.service.AdminService;
import com.thirdpartyvendor.api.dto.UserResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.dto.TradeResponse;
import com.thirdpartyvendor.api.dto.CashHoldingResponse;
import com.thirdpartyvendor.api.dto.AuditEventResponse;
import com.thirdpartyvendor.api.service.AuditService;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;
    private final AuditService auditService;

    public AdminController(UserService userService, AdminService adminService, AuditService auditService) {
        this.userService = userService;
        this.adminService = adminService;
        this.auditService = auditService;
    }

    @PostMapping("/users/{userId}/freeze")
    public ResponseEntity<Void> freezeAccount(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.freezeAccount(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/users/{userId}/unfreeze")
    public ResponseEntity<Void> unfreezeAccount(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.unfreezeAccount(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/users/{userId}/soft-delete")
    public ResponseEntity<Void> softDeleteUser(
        @PathVariable Long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        userService.softDeleteUser(userId, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers(@AuthenticationPrincipal AppUser currentUser) {
        return adminService.getAllUsers(currentUser);
    }

    @GetMapping("/users/{userId}")
    public UserResponse getUserById(
        @PathVariable Long userId, 
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return adminService.getUserById(userId, currentUser);
    }

    @GetMapping("/users/{userId}/orders")
    public List<OrderResponse> getUserOrders(
        @PathVariable Long userId,
        @AuthenticationPrincipal AppUser currentUser
    ){
        return adminService.getUserOrders(currentUser, userId);
    }

    @GetMapping("/users/{userId}/trades")
    public List<TradeResponse> getUserTrades(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return adminService.getUserTrades(userId, currentUser);
    }

    @GetMapping("/users/{userId}/cash-holdings")
    public List<CashHoldingResponse> getUserCashHoldings(
        @PathVariable long userId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return adminService.getUserCashHoldings(userId, currentUser);
    }

    @GetMapping("/audit/clients")
    public AuditPageResponse<AuditClientResponse> searchAuditClients(
        @RequestParam String search,
        @RequestParam(defaultValue = "0") int page,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return auditService.searchClients(search, page, currentUser);
    }

    @GetMapping("/audit/clients/{clientId}/events")
    public AuditPageResponse<AuditEventResponse> searchAuditEvents(
        @PathVariable Long clientId,
        @RequestParam(defaultValue = "") String type,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(defaultValue = "") String instrument,
        @RequestParam(defaultValue = "0") int page,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return auditService.searchEvents(clientId, type, from, to, instrument, page, currentUser);
    }

    @GetMapping("/audit/{eventType}/{eventId}")
    public AuditEventResponse getAuditEvent(
        @PathVariable String eventType,
        @PathVariable String eventId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return auditService.findEvent(eventType, eventId, currentUser);
    }

}

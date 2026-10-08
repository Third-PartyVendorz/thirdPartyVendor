package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.UserResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

@Service
public class AdminService {
    private final AppUserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminService(AppUserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<UserResponse> getAllUsers(AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);

        return userRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public List<OrderResponse> getUserOrders(AppUser currentUser, Long userId) {
        AuthorizationUtil.requireAdmin(currentUser);

        return orderRepository.findByUserId(userId).stream()
            .map(order -> new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getAssetId(),
                order.getTicker(),
                order.getOrderIntent(),
                order.getQuantity(),
                order.getOrderPrice(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getOrderCurrency()
            )).collect(Collectors.toList());
    }

    private UserResponse mapToResponse(AppUser user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.isFrozen(),
            user.isActive()
        );
    }
}

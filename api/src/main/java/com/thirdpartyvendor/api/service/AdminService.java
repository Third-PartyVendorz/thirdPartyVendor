package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.UserResponse;
import com.thirdpartyvendor.api.dto.OrderResponse;
import com.thirdpartyvendor.api.dto.TradeResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;
import com.thirdpartyvendor.api.error.UserExceptions.UserNotFoundException;

@Service
public class AdminService {
    private final AppUserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;

    public AdminService(AppUserRepository userRepository, OrderRepository orderRepository, TradeRepository tradeRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
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

    public UserResponse getUserById(Long userId, AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);

        AppUser user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));

        return mapToResponse(user);
    }

    // This looks so ugly becuase we Trade doesn't have a ticker value, 
    // so in every lookup we have to reference the orderId to get the ticker.
    public List<TradeResponse> getUserTrades(Long userId, AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);

        List<Order> userOrders = orderRepository.findByUserId(userId);
        List<Long> orderIds = userOrders.stream().map(Order::getId).collect(Collectors.toList());

        return tradeRepository.findAll().stream()
            .filter(trade -> orderIds.contains(trade.getOrderId()))
            .map(trade -> {
                Order order = orderRepository.findById(trade.getOrderId()).orElse(null);
                String ticker = order != null ? order.getTicker() : "UNKNOWN";
                return new TradeResponse(
                    trade.getTradeId(),
                    trade.getOrderId(),
                    ticker,
                    trade.getExecutionPrice(),
                    trade.getExecutionQuantity(),
                    trade.getTradeTimestamp(),
                    trade.getTradeCurrency()
                );
            }).collect(Collectors.toList());
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

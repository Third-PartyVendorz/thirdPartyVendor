package com.thirdpartyvendor.api.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.repository.OrderRepository;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Component
public class OrderScheduler {
    private static final Logger log = LogManager.getLogger(OrderScheduler.class);

    private final OrderRepository orderRepository;
    private final OrderExecutionService orderExecutionService;

    public OrderScheduler(OrderRepository orderRepository, OrderExecutionService orderExecutionService) {
        this.orderRepository = orderRepository;
        this.orderExecutionService = orderExecutionService;
    }

    @Scheduled(cron = "0 30 9 * * MON-FRI", zone = "America/New_York")
    public void executeAfterMarketOrders() {
        if (!MarketHoursService.isOpen()) {
            log.info("Market is closed. Skipping after-market order execution.");
            return;
        }

        log.info("Executing after-market orders.");
        orderRepository.findByStatus(Order.OrderStatus.PENDING)
            .forEach(order -> {
                try {
                    orderExecutionService.executeOrder(order.getId(), order.getUserId());
                } catch (RuntimeException exception) {
                    log.error("Failed to execute pending order {}", order.getId(), exception);
                }
            });
    }
}
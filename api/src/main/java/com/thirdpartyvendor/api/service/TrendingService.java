package com.thirdpartyvendor.api.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;

import com.thirdpartyvendor.api.dto.TrendingTickerResponse;
import com.thirdpartyvendor.api.entity.Order.OrderStatus;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;
import com.thirdpartyvendor.api.repository.OrderRepository;

@Service
public class TrendingService {

    private final OrderRepository orderRepository;

    public TrendingService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<TrendingTickerResponse> getTrendingTickers(Instant from, Instant to, int k) {
        if (from == null || to == null) {
            throw new BadOrderException("Timeframe start and end are required");
        }

        if (from.isAfter(to)) {
            throw new BadOrderException("Timeframe start must be before timeframe end");
        }

        if (k < 1) {
            throw new BadOrderException("k must be at least 1");
        }

        // Order.createdAt is written with LocalDateTime.now(), so the window uses the server's default zone.
        LocalDateTime fromLocal = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        LocalDateTime toLocal = LocalDateTime.ofInstant(to, ZoneId.systemDefault());

        return orderRepository.findTickerOrderCounts(OrderStatus.CANCELLED, fromLocal, toLocal).stream()
            .limit(k)
            .map(row -> new TrendingTickerResponse(row.getTicker(), row.getOrderCount()))
            .toList();
    }
}

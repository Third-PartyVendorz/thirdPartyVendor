package com.thirdpartyvendor.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.AuditEventResponse;
import com.thirdpartyvendor.api.entity.AppUser;
import com.thirdpartyvendor.api.entity.ForexLog;
import com.thirdpartyvendor.api.entity.Order;
import com.thirdpartyvendor.api.entity.Trade;
import com.thirdpartyvendor.api.repository.AppUserRepository;
import com.thirdpartyvendor.api.repository.ForexLogRepository;
import com.thirdpartyvendor.api.repository.OrderRepository;
import com.thirdpartyvendor.api.repository.TradeRepository;
import com.thirdpartyvendor.api.util.AuthorizationUtil;

@Service
public class AuditService {
    private final AppUserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final ForexLogRepository forexLogRepository;

    public AuditService(
        AppUserRepository userRepository,
        OrderRepository orderRepository,
        TradeRepository tradeRepository,
        ForexLogRepository forexLogRepository
    ) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
        this.forexLogRepository = forexLogRepository;
    }

    public AuditEventResponse findEvent(String eventType, String eventId, AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);
        Long numericEventId = parseEventId(eventId);

        return switch (eventType.toLowerCase()) {
            case "trade" -> mapTrade(findTrade(numericEventId));
            case "order" -> mapOrder(findOrder(numericEventId));
            case "forex" -> mapForex(findForex(numericEventId));
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported audit event type");
        };
    }

    private Long parseEventId(String eventId) {
        try {
            return Long.valueOf(eventId.trim());
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID must be numeric");
        }
    }

    private Trade findTrade(Long eventId) {
        return tradeRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trade not found"));
    }

    private Order findOrder(Long eventId) {
        return orderRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private ForexLog findForex(Long eventId) {
        return forexLogRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forex exchange not found"));
    }

    private AuditEventResponse mapOrder(Order order) {
        AppUser client = findClient(order.getUserId());
        String status = order.getStatus().name();
        String action = switch (order.getStatus()) {
            case FILLED -> "Order filled";
            case CANCELLED -> "Order cancelled";
            default -> "Order accepted";
        };

        return new AuditEventResponse(
            String.valueOf(order.getId()), "Order", action, clientName(client), client.getId(),
            String.valueOf(order.getId()), order.getTicker(), status, order.getCreatedAt(), "Order service",
            order.getOrderIntent() + " order recorded for " + order.getQuantity() + " " + order.getTicker() + ".",
            List.of(
                "Order intent: " + order.getOrderIntent(),
                "Requested quantity: " + order.getQuantity(),
                "Requested price: " + order.getOrderPrice() + " " + order.getOrderCurrency()
            ),
            "Requested price: " + order.getOrderPrice() + " " + order.getOrderCurrency(),
            "No cash or holdings impact recorded at order creation"
        );
    }

    private AuditEventResponse mapTrade(Trade trade) {
        Order order = findOrder(trade.getOrderId());
        AppUser client = findClient(order.getUserId());
        String currency = trade.getTradeCurrency() == null ? "" : " " + trade.getTradeCurrency();

        return new AuditEventResponse(
            String.valueOf(trade.getTradeId()), "Trade", "Trade completed", clientName(client), client.getId(),
            String.valueOf(trade.getTradeId()), trade.getTicker(), "Completed", trade.getTradeTimestamp(), "Execution service",
            trade.getExecutionQuantity() + " " + trade.getTicker() + " executed for the client.",
            List.of(
                "Related order: " + trade.getOrderId(),
                "Execution quantity: " + trade.getExecutionQuantity() + " " + trade.getTicker(),
                "Execution currency: " + (trade.getTradeCurrency() == null ? "Not recorded" : trade.getTradeCurrency())
            ),
            "Execution price: " + trade.getExecutionPrice() + currency,
            "Execution recorded; cash and holdings settlement must be reconciled from the related account records"
        );
    }

    private AuditEventResponse mapForex(ForexLog exchange) {
        AppUser client = findClient(exchange.getUserId());

        return new AuditEventResponse(
            String.valueOf(exchange.getExchangeId()), "Forex exchange", "Exchange completed", clientName(client), client.getId(),
            String.valueOf(exchange.getExchangeId()), exchange.getFromCurrency() + " / " + exchange.getToCurrency(),
            "Completed", exchange.getExchangeTimestamp(), "Forex service",
            exchange.getFromAmount() + " " + exchange.getFromCurrency() + " exchanged for the client.",
            List.of(
                "From amount: " + exchange.getFromAmount() + " " + exchange.getFromCurrency(),
                "To amount: " + exchange.getToAmount() + " " + exchange.getToCurrency(),
                "Exchange timestamp: " + exchange.getExchangeTimestamp()
            ),
            "Exchange rate: " + exchange.getExchangeRate() + " " + exchange.getToCurrency() + " per " + exchange.getFromCurrency(),
            "Cash -" + exchange.getFromAmount() + " " + exchange.getFromCurrency() + "; cash +" + exchange.getToAmount() + " " + exchange.getToCurrency()
        );
    }

    private AppUser findClient(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    private String clientName(AppUser client) {
        return client.getFirstName() + " " + client.getLastName();
    }
}
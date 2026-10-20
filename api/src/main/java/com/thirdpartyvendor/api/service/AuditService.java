package com.thirdpartyvendor.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
import com.thirdpartyvendor.api.error.AuditExceptions.AuditEventNotFoundException;
import com.thirdpartyvendor.api.error.AuditExceptions.InvalidAuditIdException;
import com.thirdpartyvendor.api.error.AuditExceptions.UnsupportedAuditEventException;

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
            default -> throw new UnsupportedAuditEventException("Unsupported audit event type: " + eventType);
        };
    }

    private Long parseEventId(String eventId) {
        try {
            Long parsedId = Long.valueOf(eventId.trim());
            if (parsedId <= 0) {
                throw new InvalidAuditIdException("The event ID must be a positive number");
            }
            return parsedId;
        } catch (NumberFormatException exception) {
            throw new InvalidAuditIdException("The event ID must be a positive number");
        }
    }

    private Trade findTrade(Long eventId) {
        return tradeRepository.findById(eventId)
            .orElseThrow(() -> new AuditEventNotFoundException("No trade was found with ID " + eventId));
    }

    private Order findOrder(Long eventId) {
        return orderRepository.findById(eventId)
            .orElseThrow(() -> new AuditEventNotFoundException("No order was found with ID " + eventId));
    }

    private ForexLog findForex(Long eventId) {
        return forexLogRepository.findById(eventId)
            .orElseThrow(() -> new AuditEventNotFoundException("No forex exchange was found with ID " + eventId));
    }

    private AuditEventResponse mapOrder(Order order) {
        AppUser client = findClient(order.getUserId());
        String status = order.getStatus().name();
        String action = switch (order.getStatus()) {
            case EXECUTED -> "Order executed";
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
            .orElseThrow(() -> new AuditEventNotFoundException("The client linked to this event could not be found"));
    }

    private String clientName(AppUser client) {
        return client.getFirstName() + " " + client.getLastName();
    }
}
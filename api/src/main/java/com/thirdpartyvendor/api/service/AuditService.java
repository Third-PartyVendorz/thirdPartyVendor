package com.thirdpartyvendor.api.service;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

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
        Trade execution = tradeRepository.findByOrderId(order.getId()).stream().findFirst().orElse(null);
        BigDecimal calculatedQuantity = calculateQuantity(order, execution);
        String submittedPrice = "Instrument price at order: " + formatPrice(order.getInstrumentPriceAtOrder(), order.getOrderCurrency());
        String executionPrice = execution == null
            ? null
            : "Execution price: " + formatPrice(execution.getExecutionPrice(), execution.getTradeCurrency());
        String priceDetail = executionPrice == null ? submittedPrice : submittedPrice + "; " + executionPrice;
        String summary = calculatedQuantity != null
            ? order.getOrderIntent() + " order recorded for " + calculatedQuantity + " " + order.getTicker() + " at " + priceDetail + "."
            : order.getOrderIntent() + " order value of " + formatPrice(order.getOrderPrice(), order.getOrderCurrency()) + " recorded for " + order.getTicker() + ".";
        String status = switch (order.getStatus()) {
            case PENDING -> "Pending";
            case FILLED -> "Filled";
            case CANCELLED -> "Cancelled";
        };
        String action = switch (order.getStatus()) {
            case PENDING -> "Order pending";
            case FILLED -> "Order filled";
            case CANCELLED -> "Order cancelled";
        };

        return new AuditEventResponse(
            String.valueOf(order.getId()), "Order", action, clientName(client), client.getId(),
            String.valueOf(order.getId()), order.getTicker(), status, order.getCreatedAt(), "Order service",
            summary,
            List.of(
                "Order intent: " + order.getOrderIntent(),
                calculatedQuantity == null
                    ? "Quantity: Not yet determined"
                    : (order.getQuantity() == null ? "Calculated quantity: " : "Requested quantity: ") + calculatedQuantity,
                submittedPrice,
                executionPrice == null ? "Execution price: Not recorded" : executionPrice
            ),
            priceDetail,
            "No cash or holdings impact recorded at order creation"
        );
    }

    private BigDecimal calculateQuantity(Order order, Trade execution) {
        if (order.getQuantity() != null) {
            return order.getQuantity();
        }
        if (order.getOrderPrice() == null || execution == null || execution.getExecutionPrice() == null
            || execution.getExecutionPrice().compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return order.getOrderPrice().divide(execution.getExecutionPrice(), 4, RoundingMode.HALF_UP);
    }

    private String formatPrice(java.math.BigDecimal price, String currency) {
        if (price == null) {
            return "Not recorded";
        }
        return currency == null || currency.isBlank() ? price.toString() : price + " " + currency;
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
                "Execution currency: " + (trade.getTradeCurrency() == null ? "Not recorded" : trade.getTradeCurrency()),
                "Instrument price at order: " + formatPrice(order.getInstrumentPriceAtOrder(), order.getOrderCurrency()),
                "Execution price: " + formatPrice(trade.getExecutionPrice(), trade.getTradeCurrency())
            ),
            "Instrument price at order: " + formatPrice(order.getInstrumentPriceAtOrder(), order.getOrderCurrency())
                + "; Execution price: " + trade.getExecutionPrice() + currency,
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
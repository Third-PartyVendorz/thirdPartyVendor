package com.thirdpartyvendor.api.service;

import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.dto.AuditEventResponse;
import com.thirdpartyvendor.api.dto.AuditClientResponse;
import com.thirdpartyvendor.api.dto.AuditPageResponse;
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

    public AuditPageResponse<AuditClientResponse> searchClients(String search, int page, AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);
        validatePage(page);
        if (search == null || search.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a client name or email");
        }
        var clients = userRepository.searchAuditClients(search.trim(),
            PageRequest.of(page, 20, Sort.by("lastName", "firstName", "id")));
        return new AuditPageResponse<>(clients.getContent().stream()
            .map(client -> new AuditClientResponse(client.getId(), clientName(client), client.getEmail())).toList(),
            clients.getTotalElements(), page, 20);
    }

    public AuditPageResponse<AuditEventResponse> searchEvents(Long clientId, String eventType,
        LocalDate from, LocalDate to, String instrument, int page, AppUser currentUser) {
        AuthorizationUtil.requireAdmin(currentUser);
        validatePage(page);
        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must not be after end date");
        }
        String type = eventType == null ? "" : eventType.trim().toLowerCase(Locale.ROOT);
        if (!List.of("", "order", "trade", "forex").contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported audit event type");
        }
        findClient(clientId);
        List<AuditEventResponse> events = new ArrayList<>();
        if (type.isEmpty() || type.equals("order") || type.equals("trade")) {
            List<Order> orders = orderRepository.findByUserId(clientId);
            if (type.isEmpty() || type.equals("order")) {
                orders.stream().map(this::mapOrder).forEach(events::add);
            }
            if ((type.isEmpty() || type.equals("trade")) && !orders.isEmpty()) {
                tradeRepository.findByOrderIdIn(orders.stream().map(Order::getId).toList())
                    .stream().map(this::mapTrade).forEach(events::add);
            }
        }
        if (type.isEmpty() || type.equals("forex")) {
            forexLogRepository.findByUserId(clientId).stream().map(this::mapForex).forEach(events::add);
        }
        String asset = instrument == null ? "" : instrument.replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
        List<AuditEventResponse> matches = events.stream()
            .filter(event -> from == null || !event.timestamp().toLocalDate().isBefore(from))
            .filter(event -> to == null || !event.timestamp().toLocalDate().isAfter(to))
            .filter(event -> asset.isEmpty() || event.instrument().replaceAll("\\s+", "")
                .toUpperCase(Locale.ROOT).contains(asset))
            .sorted(Comparator.comparing(AuditEventResponse::timestamp).reversed()
                .thenComparing(AuditEventResponse::type).thenComparing(AuditEventResponse::id))
            .toList();
        List<AuditEventResponse> items = matches.stream().skip((long) page * 20).limit(20).toList();
        return new AuditPageResponse<>(items, matches.size(), page, 20);
    }

    private void validatePage(int page) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page must not be negative");
        }
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

    private String formatPrice(BigDecimal price, String currency) {
        if (price == null) {
            return "Not recorded";
        }
        String amount = price.setScale(2, RoundingMode.HALF_UP).toPlainString();
        return currency == null || currency.isBlank() ? amount : amount + " " + currency;
    }

    private AuditEventResponse mapTrade(Trade trade) {
        Order order = findOrder(trade.getOrderId());
        AppUser client = findClient(order.getUserId());

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
                + "; Execution price: " + formatPrice(trade.getExecutionPrice(), trade.getTradeCurrency()),
            "Execution recorded; cash and holdings settlement must be reconciled from the related account records"
        );
    }

    private AuditEventResponse mapForex(ForexLog exchange) {
        AppUser client = findClient(exchange.getUserId());
        String fromAmount = formatPrice(exchange.getFromAmount(), exchange.getFromCurrency());
        String toAmount = formatPrice(exchange.getToAmount(), exchange.getToCurrency());

        return new AuditEventResponse(
            String.valueOf(exchange.getExchangeId()), "Forex exchange", "Exchange completed", clientName(client), client.getId(),
            String.valueOf(exchange.getExchangeId()), exchange.getFromCurrency() + " / " + exchange.getToCurrency(),
            "Completed", exchange.getExchangeTimestamp(), "Forex service",
            fromAmount + " exchanged for the client.",
            List.of(
                "From amount: " + fromAmount,
                "To amount: " + toAmount,
                "Exchange timestamp: " + exchange.getExchangeTimestamp()
            ),
            "Exchange rate: " + exchange.getExchangeRate() + " " + exchange.getToCurrency() + " per " + exchange.getFromCurrency(),
            "Cash -" + fromAmount + "; cash +" + toAmount
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
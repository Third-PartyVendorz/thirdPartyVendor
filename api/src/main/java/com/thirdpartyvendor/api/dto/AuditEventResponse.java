package com.thirdpartyvendor.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AuditEventResponse(
    String id,
    String type,
    String action,
    String client,
    Long clientId,
    String reference,
    String instrument,
    String status,
    LocalDateTime timestamp,
    String actor,
    String summary,
    List<String> details,
    String pricing,
    String impact
) {}
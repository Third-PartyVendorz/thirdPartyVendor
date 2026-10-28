package com.thirdpartyvendor.api.dto;

import java.util.List;

public record AuditPageResponse<T>(List<T> items, long total, int page, int pageSize) {}
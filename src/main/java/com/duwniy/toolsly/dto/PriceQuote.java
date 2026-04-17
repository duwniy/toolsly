package com.duwniy.toolsly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PriceQuote {
    private BigDecimal basePrice;
    private BigDecimal weekendMarkup;
    private BigDecimal durationDiscount;
    private BigDecimal totalPrice;
    private long days;
}

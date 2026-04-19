package com.duwniy.toolsly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PriceQuote {
    private BigDecimal basePrice;
    private BigDecimal weekendMarkup;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private Integer rentalDays;
    private List<String> markupReasons = new ArrayList<>();
    private List<String> discountReasons = new ArrayList<>();

    public PriceQuote() {}

    public BigDecimal getBasePrice() { return basePrice; }
    public BigDecimal getWeekendMarkup() { return weekendMarkup; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public Integer getRentalDays() { return rentalDays; }
    public List<String> getMarkupReasons() { return markupReasons; }
    public List<String> getDiscountReasons() { return discountReasons; }

    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public void setWeekendMarkup(BigDecimal weekendMarkup) { this.weekendMarkup = weekendMarkup; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }
    public void setMarkupReasons(List<String> markupReasons) { this.markupReasons = markupReasons; }
    public void setDiscountReasons(List<String> discountReasons) { this.discountReasons = discountReasons; }

    public static PriceQuoteBuilder builder() {
        return new PriceQuoteBuilder();
    }

    public static class PriceQuoteBuilder {
        private PriceQuote quote = new PriceQuote();

        public PriceQuoteBuilder basePrice(BigDecimal basePrice) { quote.setBasePrice(basePrice); return this; }
        public PriceQuoteBuilder weekendMarkup(BigDecimal weekendMarkup) { quote.setWeekendMarkup(weekendMarkup); return this; }
        public PriceQuoteBuilder discountAmount(BigDecimal discountAmount) { quote.setDiscountAmount(discountAmount); return this; }
        public PriceQuoteBuilder totalPrice(BigDecimal totalPrice) { quote.setTotalPrice(totalPrice); return this; }
        public PriceQuoteBuilder rentalDays(Integer rentalDays) { quote.setRentalDays(rentalDays); return this; }
        public PriceQuoteBuilder markupReasons(List<String> markupReasons) { quote.setMarkupReasons(markupReasons); return this; }
        public PriceQuoteBuilder discountReasons(List<String> discountReasons) { quote.setDiscountReasons(discountReasons); return this; }

        public PriceQuote build() {
            return quote;
        }
    }
}

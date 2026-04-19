package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.PriceQuote;
import com.duwniy.toolsly.entity.EquipmentModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PricingEngineService {
    private static final Logger log = LoggerFactory.getLogger(PricingEngineService.class);

    public PriceQuote calculatePrice(EquipmentModel model, OffsetDateTime start, OffsetDateTime end) {
        log.info("Calculating price for model={}, from={} to={}", model.getName(), start, end);
        long minutes = ChronoUnit.MINUTES.between(start, end);
        long days = (long) Math.ceil((double) minutes / (24 * 60));
        if (days <= 0) days = 1;

        BigDecimal dailyBase = model.getBaseDailyPrice();
        BigDecimal baseSum = dailyBase.multiply(BigDecimal.valueOf(days));
        BigDecimal markupSum = BigDecimal.ZERO;

        for (int i = 0; i < days; i++) {
            LocalDate current = start.plusDays(i).toLocalDate();
            if (current.getDayOfWeek() == DayOfWeek.SATURDAY || current.getDayOfWeek() == DayOfWeek.SUNDAY) {
                // +20% Weekend Markup
                BigDecimal dailyMarkup = dailyBase.multiply(BigDecimal.valueOf(0.2));
                markupSum = markupSum.add(dailyMarkup);
            }
        }

        BigDecimal priceBeforeDiscount = baseSum.add(markupSum);
        BigDecimal discountSum = BigDecimal.ZERO;

        if (days >= 8) {
            // -10% Bulk Discount
            discountSum = priceBeforeDiscount.multiply(BigDecimal.valueOf(0.1)).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal total = priceBeforeDiscount.subtract(discountSum);

        PriceQuote quote = PriceQuote.builder()
                .basePrice(baseSum)
                .weekendMarkup(markupSum)
                .discountAmount(discountSum)
                .totalPrice(total)
                .rentalDays((int) days)
                .markupReasons(markupSum.compareTo(BigDecimal.ZERO) > 0 ? java.util.List.of("Weekend Premium (+20%)") : new java.util.ArrayList<>())
                .discountReasons(discountSum.compareTo(BigDecimal.ZERO) > 0 ? java.util.List.of("Long-term Discount (-10%)") : new java.util.ArrayList<>())
                .build();

        log.info("Detailed Price: Base={}, Markup={}, Discount={}, Total={}, Days={}", 
                baseSum, markupSum, discountSum, total, days);
        return quote;
    }
}

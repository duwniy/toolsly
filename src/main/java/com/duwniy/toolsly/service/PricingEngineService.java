package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.PriceQuote;
import com.duwniy.toolsly.entity.EquipmentModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Service
@Slf4j
public class PricingEngineService {

    public PriceQuote calculatePrice(EquipmentModel model, OffsetDateTime start, OffsetDateTime end) {
        log.info("Calculating price for model={}, from={} to={}", model.getName(), start, end);
        long days = ChronoUnit.DAYS.between(start, end);
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
                .totalPrice(total)
                .days(days)
                .build();
        log.info("Price calculation result: total={}, days={}, discount={}", total, days, discountSum);
        return quote;
    }
}

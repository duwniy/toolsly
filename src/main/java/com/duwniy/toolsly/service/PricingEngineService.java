package com.duwniy.toolsly.service;

import com.duwniy.toolsly.entity.EquipmentModel;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PricingEngineService {

    public BigDecimal calculatePrice(EquipmentModel model, OffsetDateTime start, OffsetDateTime end) {
        long days = ChronoUnit.DAYS.between(start, end);
        if (days <= 0) days = 1;

        BigDecimal basePrice = model.getBaseDailyPrice();
        BigDecimal total = BigDecimal.ZERO;

        for (int i = 0; i < days; i++) {
            LocalDate current = start.plusDays(i).toLocalDate();
            BigDecimal dailyRate = basePrice;

            if (current.getDayOfWeek() == DayOfWeek.SATURDAY || current.getDayOfWeek() == DayOfWeek.SUNDAY) {
                dailyRate = dailyRate.multiply(BigDecimal.valueOf(1.2)); // Weekend Markup +20%
            }
            total = total.add(dailyRate);
        }

        if (days >= 8) {
            total = total.multiply(BigDecimal.valueOf(0.9)); // Bulk Discount -10%
        }

        return total;
    }
}

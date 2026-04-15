package com.duwniy.toolsly.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "equipment_models")
@Getter
@Setter
@NoArgsConstructor
public class EquipmentModel extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String manufacturer;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> specifications;

    @Column(name = "base_daily_price", nullable = false)
    private BigDecimal baseDailyPrice;

    @Column(name = "market_value", nullable = false)
    private BigDecimal marketValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}

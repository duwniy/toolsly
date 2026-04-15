package com.duwniy.toolsly.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
public class Branch extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "storage_capacity", nullable = false)
    private Integer storageCapacity = 100;

    @Column(name = "is_active")
    private boolean active = true;
}

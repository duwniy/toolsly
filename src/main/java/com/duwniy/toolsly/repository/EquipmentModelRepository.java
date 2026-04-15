package com.duwniy.toolsly.repository;

import com.duwniy.toolsly.entity.EquipmentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EquipmentModelRepository extends JpaRepository<EquipmentModel, UUID> {
}

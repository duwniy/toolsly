package com.duwniy.toolsly.repository;

import com.duwniy.toolsly.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {
}

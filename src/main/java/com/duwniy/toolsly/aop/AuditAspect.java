package com.duwniy.toolsly.aop;

import com.duwniy.toolsly.entity.AuditLog;
import com.duwniy.toolsly.repository.AuditLogRepository;
import com.duwniy.toolsly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    // Simplified version: log all saves in a specific package
    @AfterReturning(pointcut = "execution(* com.duwniy.toolsly.repository.*.save(..))", returning = "result")
    public void auditSave(JoinPoint joinPoint, Object result) {
        String entityName = result.getClass().getSimpleName();
        // This is a simplified logic to demonstrate AOP
        // In a real project, we would compare states or use Hibernate Envers
        
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        
        AuditLog log = AuditLog.builder()
                .entityName(entityName)
                .action("SAVE")
                .timestamp(java.time.OffsetDateTime.now())
                .build();
        
        // Try to get ID via reflected getId() if needed, but keeping it simple for now
        // auditLogRepository.save(log);
    }
}

package com.duwniy.toolsly.aop;

import com.duwniy.toolsly.entity.AuditLog;
import com.duwniy.toolsly.repository.AuditLogRepository;
import com.duwniy.toolsly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @AfterReturning(pointcut = "execution(* com.duwniy.toolsly.repository.*.save(..)) && !execution(* com.duwniy.toolsly.repository.AuditLogRepository.save(..))", returning = "result")
    public void auditSave(JoinPoint joinPoint, Object result) {
        try {
            String entityName = result.getClass().getSimpleName();
            String action = "SAVE";

            String userEmail = "system";
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            }

            UUID entityId = extractEntityId(result);

            AuditLog auditLog = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .newValue(Map.of("message", "Saved " + entityName + " by " + userEmail))
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to create audit log: {}", e.getMessage());
        }
    }

    private UUID extractEntityId(Object entity) {
        try {
            var method = entity.getClass().getMethod("getId");
            Object id = method.invoke(entity);
            if (id instanceof UUID) {
                return (UUID) id;
            }
        } catch (Exception ignored) {
        }
        return UUID.randomUUID();
    }
}

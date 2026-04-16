package com.duwniy.toolsly.dto;

import java.time.OffsetDateTime;

/**
 * Standard error response for API exceptions.
 * Manually implemented constructor to bypass Lombok annotation processor issues in this environment.
 */
public class ErrorResponse {
    private int status;
    private String message;
    private OffsetDateTime timestamp;
    private String errorCode;

    public ErrorResponse() {}

    public ErrorResponse(int status, String message, OffsetDateTime timestamp, String errorCode) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.errorCode = errorCode;
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
}

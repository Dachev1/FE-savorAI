package dev.idachev.backend.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response for REST API.
 */
@Getter
@Setter
@NoArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> errors;
    
    /**
     * Creates a new error response with the specified status, message, and timestamp.
     *
     * @param status    the HTTP status code
     * @param message   the error message
     * @param timestamp the time when the error occurred
     */
    public ErrorResponse(int status, String message, LocalDateTime timestamp) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }
    
    /**
     * Creates a new error response with the specified status, message, timestamp, and validation errors.
     *
     * @param status    the HTTP status code
     * @param message   the error message
     * @param timestamp the time when the error occurred
     * @param errors    the validation errors map (field name to error message)
     */
    public ErrorResponse(int status, String message, LocalDateTime timestamp, Map<String, String> errors) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.errors = errors;
    }
}
package dev.idachev.backend.common.exception;

public class MappingException extends RuntimeException {
    public MappingException(String message, Throwable cause) {
        super(message, cause);
    }
} 
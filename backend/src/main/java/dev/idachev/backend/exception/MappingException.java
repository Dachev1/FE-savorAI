package dev.idachev.backend.exception;

public class MappingException extends RuntimeException {
    public MappingException(String message, Throwable cause) {
        super(message, cause);
    }
} 
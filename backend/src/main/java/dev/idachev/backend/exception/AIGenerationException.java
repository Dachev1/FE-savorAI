package dev.idachev.backend.exception;

public class AIGenerationException extends RuntimeException {
    public AIGenerationException(String message) {
        super(message);
    }

    public AIGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}

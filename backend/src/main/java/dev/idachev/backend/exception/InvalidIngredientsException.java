package dev.idachev.backend.exception;

public class InvalidIngredientsException extends RuntimeException {
    public InvalidIngredientsException(String message) {
        super(message);
    }
}

package ct01.n06.backend.exception;

public class RequestException extends RuntimeException {
    public RequestException(String message) {
        super(message);
    }
}

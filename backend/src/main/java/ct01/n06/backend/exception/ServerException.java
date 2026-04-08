package ct01.n06.backend.exception;

public class ServerException extends RuntimeException {
    public ServerException(String message) {
        super(message);
    }
}

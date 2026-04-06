package ct01.n06.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RequestException.class)
    public ErrorResponse handleRequestException(RequestException ex) {
        ex.printStackTrace();
        return ErrorResponse.create(ex, HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ErrorResponse handleUnauthorizedException(UnauthorizedException ex) {
        ex.printStackTrace();
        return ErrorResponse.create(ex, HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ErrorResponse handleForbiddenException(ForbiddenException ex) {
        System.err.println("FORBIDDEN EXCEPTION CAUGHT: " + ex.getMessage());
        ex.printStackTrace();
        return ErrorResponse.create(ex, HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ErrorResponse handleNotFoundException(NotFoundException ex) {
        ex.printStackTrace();
        return ErrorResponse.create(ex, HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ServerException.class)
    public ErrorResponse handleServerException(ServerException ex) {
        ex.printStackTrace();
        return ErrorResponse.create(ex, HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }
}

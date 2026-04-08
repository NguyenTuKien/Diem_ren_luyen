package ct01.n06.backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int limit() default 5;       // Số request tối đa
    int window() default 10;     // Cửa sổ thời gian (giây)
    boolean isGlobal() default false;
}
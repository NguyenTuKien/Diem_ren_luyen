package ct01.n06.backend.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "qr_checkin_queue";
    public static final String EXCHANGE_NAME = "qr_checkin_exchange";
    public static final String ROUTING_KEY = "checkin.attendance";

    @Bean
    public Queue qrCheckinQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public DirectExchange qrCheckinExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding bindingQrCheckin(Queue qrCheckinQueue, DirectExchange qrCheckinExchange) {
        return BindingBuilder.bind(qrCheckinQueue).to(qrCheckinExchange).with(ROUTING_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {

        return new JacksonJsonMessageConverter();
    }
}

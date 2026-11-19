package com.admanager;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
@SpringBootApplication
@EnableAsync
public class AdManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdManagerApplication.class, args);
    }
}

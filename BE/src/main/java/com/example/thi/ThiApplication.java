package com.example.thi;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.WebApplicationType;

@SpringBootApplication
public class ThiApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(ThiApplication.class)
                .web(WebApplicationType.SERVLET)
                .run(args);
    }

}

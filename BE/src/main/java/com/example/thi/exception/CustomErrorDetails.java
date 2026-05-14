package com.example.thi.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class CustomErrorDetails {

    private LocalDateTime timestamp;
    private String message;
    private String details;
}

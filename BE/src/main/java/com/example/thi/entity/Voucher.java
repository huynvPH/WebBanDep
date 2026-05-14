package com.example.thi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Boolean active;

    private String code;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "discount_type")
    private String discountType;

    @Column(name = "discount_value")
    private Double discountValue;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "min_order")
    private Double minOrder;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount;
}

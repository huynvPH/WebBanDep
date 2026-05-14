package com.example.thi.controller;

import com.example.thi.entity.Voucher;
import com.example.thi.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin("*")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable UUID id) {
        Voucher voucher = voucherService.getVoucherById(id);
        return voucher != null ? ResponseEntity.ok(voucher) : ResponseEntity.notFound().build();
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Voucher> getVoucherByCode(@PathVariable String code) {
        Voucher voucher = voucherService.getVoucherByCode(code);
        return voucher != null ? ResponseEntity.ok(voucher) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherService.createVoucher(voucher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable UUID id, @RequestBody Voucher voucher) {
        Voucher updated = voucherService.updateVoucher(id, voucher);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable UUID id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}

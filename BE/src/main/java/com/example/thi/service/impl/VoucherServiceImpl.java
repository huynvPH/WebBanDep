package com.example.thi.service.impl;

import com.example.thi.entity.Voucher;
import com.example.thi.repository.VoucherRepository;
import com.example.thi.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher getVoucherById(UUID id) {
        return voucherRepository.findById(id).orElse(null);
    }

    @Override
    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findAll().stream()
                .filter(v -> v.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Voucher createVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateVoucher(UUID id, Voucher voucher) {
        Voucher existing = getVoucherById(id);
        if (existing != null) {
            voucher.setId(id);
            return voucherRepository.save(voucher);
        }
        return null;
    }

    @Override
    public void deleteVoucher(UUID id) {
        voucherRepository.deleteById(id);
    }
}

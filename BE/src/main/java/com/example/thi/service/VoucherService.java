package com.example.thi.service;

import com.example.thi.entity.Voucher;
import java.util.List;
import java.util.UUID;

public interface VoucherService {
    List<Voucher> getAllVouchers();
    Voucher getVoucherById(UUID id);
    Voucher getVoucherByCode(String code);
    Voucher createVoucher(Voucher voucher);
    Voucher updateVoucher(UUID id, Voucher voucher);
    void deleteVoucher(UUID id);
}

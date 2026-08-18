package com.skillinfinity.payment.service.impl;

import com.skillinfinity.payment.repository.InvoiceRepository;
import com.skillinfinity.payment.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
}

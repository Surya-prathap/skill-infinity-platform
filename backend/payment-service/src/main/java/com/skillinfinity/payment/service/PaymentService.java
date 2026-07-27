package com.skillinfinity.payment.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentFailureRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.response.InvoiceResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.ReceiptResponse;

import java.util.UUID;

public interface PaymentService {

    PaymentResponse initiatePayment(UUID userId, PaymentRequest request);

    PaymentResponse confirmPayment(UUID userId, PaymentConfirmationRequest request);

    PaymentResponse failPayment(UUID userId, PaymentFailureRequest request);

    PaymentResponse getPaymentById(UUID userId, UUID paymentId);

    PageResponse<PaymentResponse> getPaymentHistory(UUID userId, int page, int size);

    InvoiceResponse getInvoice(UUID userId, UUID invoiceId);

    ReceiptResponse getReceipt(UUID userId, UUID receiptId);
}

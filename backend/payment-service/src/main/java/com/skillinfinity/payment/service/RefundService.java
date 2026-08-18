package com.skillinfinity.payment.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.payment.dto.request.RefundRequest;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.TransactionResponse;

import java.util.UUID;

public interface RefundService {

    PaymentResponse requestRefund(UUID userId, RefundRequest request);

    PaymentResponse approveRefund(UUID adminId, UUID refundId);

    PageResponse<TransactionResponse> getRefundHistory(UUID userId, int page, int size);
}

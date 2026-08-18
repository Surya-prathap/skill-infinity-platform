package com.skillinfinity.payment.mapper;

import com.skillinfinity.payment.dto.response.InvoiceResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.ReceiptResponse;
import com.skillinfinity.payment.dto.response.TransactionResponse;
import com.skillinfinity.payment.entity.Invoice;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.entity.Receipt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    @Mapping(target = "status", expression = "java(payment.getStatus() != null ? payment.getStatus().name() : null)")
    @Mapping(target = "gateway", expression = "java(payment.getGateway() != null ? payment.getGateway().name() : null)")
    PaymentResponse toPaymentResponse(Payment payment);

    @Mapping(target = "status", expression = "java(invoice.getStatus() != null ? invoice.getStatus().name() : null)")
    @Mapping(target = "paymentId", source = "payment.id")
    InvoiceResponse toInvoiceResponse(Invoice invoice);

    @Mapping(target = "paymentId", source = "payment.id")
    @Mapping(target = "invoiceId", source = "invoice.id")
    ReceiptResponse toReceiptResponse(Receipt receipt);

    @Mapping(target = "status", expression = "java(payment.getStatus() != null ? payment.getStatus().name() : null)")
    @Mapping(target = "transactionType", source = "referenceType")
    @Mapping(target = "transactionNumber", source = "paymentNumber")
    TransactionResponse toTransactionResponse(Payment payment);
}

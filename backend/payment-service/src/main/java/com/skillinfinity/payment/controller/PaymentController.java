package com.skillinfinity.payment.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.payment.dto.request.CouponRequest;
import com.skillinfinity.payment.dto.request.PaymentConfirmationRequest;
import com.skillinfinity.payment.dto.request.PaymentFailureRequest;
import com.skillinfinity.payment.dto.request.PaymentRequest;
import com.skillinfinity.payment.dto.request.RefundRequest;
import com.skillinfinity.payment.dto.response.InvoiceResponse;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.ReceiptResponse;
import com.skillinfinity.payment.dto.response.SubscriptionPlanResponse;
import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import com.skillinfinity.payment.service.CouponService;
import com.skillinfinity.payment.service.PaymentService;
import com.skillinfinity.payment.service.RefundService;
import com.skillinfinity.payment.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Payment processing, credit purchases, subscriptions, coupons, and invoicing")
public class PaymentController {

    private final PaymentService paymentService;
    private final RefundService refundService;
    private final SubscriptionService subscriptionService;
    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "Initiate payment", description = "Initiates a new payment for credit purchase or other transactions")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Payment initiated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or duplicate transaction"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody PaymentRequest request) {
        log.info("Initiate payment request for user: {}, amount: {}", userId, request.getAmount());
        PaymentResponse response = paymentService.initiatePayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated successfully", response));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm payment", description = "Confirms a successful payment with gateway details")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment confirmed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid payment or verification failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody PaymentConfirmationRequest request) {
        log.info("Confirm payment request for user: {}, paymentId: {}", userId, request.getPaymentId());
        PaymentResponse response = paymentService.confirmPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", response));
    }

    @PostMapping("/fail")
    @Operation(summary = "Report payment failure", description = "Reports a failed payment with failure details")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment failure recorded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid payment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> failPayment(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody PaymentFailureRequest request) {
        log.info("Fail payment request for user: {}, paymentId: {}", userId, request.getPaymentId());
        PaymentResponse response = paymentService.failPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment failure recorded", response));
    }

    @PostMapping("/retry")
    @Operation(summary = "Retry payment", description = "Retries a failed payment")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment retry initiated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Payment cannot be retried"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> retryPayment(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody PaymentRequest request) {
        log.info("Retry payment request for user: {}, amount: {}", userId, request.getAmount());
        PaymentResponse response = paymentService.initiatePayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment retry initiated", response));
    }

    @PostMapping("/refund")
    @Operation(summary = "Request refund", description = "Requests a refund for a completed payment")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Refund requested successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Refund not allowed or invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> requestRefund(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody RefundRequest request) {
        log.info("Refund request for user: {}, paymentId: {}", userId, request.getPaymentId());
        PaymentResponse response = refundService.requestRefund(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Refund requested successfully", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get payment history", description = "Returns paginated payment history for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment history retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getPaymentHistory(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PaymentResponse> response = paymentService.getPaymentHistory(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID", description = "Returns payment details for the given payment ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID id) {
        PaymentResponse response = paymentService.getPaymentById(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Validate and apply coupon", description = "Validates a coupon code and returns discount information")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Coupon validated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired coupon"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Void>> validateCoupon(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CouponRequest request) {
        log.info("Validate coupon request for user: {}, coupon: {}", userId, request.getCouponCode());
        couponService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", null));
    }

    @GetMapping("/subscription/plans")
    @Operation(summary = "List subscription plans", description = "Returns active subscription plans, optionally filtered by audience (LEARNER or MENTOR)")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getSubscriptionPlans(
            @RequestParam(required = false) SubscriptionPlanType type) {
        List<SubscriptionPlanResponse> plans = subscriptionService.getActivePlans(type);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/subscription/mine")
    @Operation(summary = "My subscription", description = "Returns the authenticated user's current active subscription, if any")
    public ResponseEntity<ApiResponse<MySubscriptionResponse>> getMySubscription(
            @RequestHeader("X-User-ID") UUID userId) {
        MySubscriptionResponse subscription = subscriptionService.getMySubscription(userId);
        return ResponseEntity.ok(ApiResponse.success(subscription));
    }

    @PostMapping("/subscription/{id}/cancel")
    @Operation(summary = "Cancel subscription", description = "Cancels an active subscription")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Subscription cancelled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Subscription not active or invalid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID id) {
        log.info("Cancel subscription for user: {}, subscriptionId: {}", userId, id);
        subscriptionService.cancelSubscription(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", null));
    }

    @GetMapping("/invoice/{id}")
    @Operation(summary = "Get invoice by ID", description = "Returns invoice details for the given invoice ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID id) {
        InvoiceResponse response = paymentService.getInvoice(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/receipt/{id}")
    @Operation(summary = "Get receipt by ID", description = "Returns receipt details for the given receipt ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Receipt details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Receipt not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ReceiptResponse>> getReceipt(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID id) {
        ReceiptResponse response = paymentService.getReceipt(userId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

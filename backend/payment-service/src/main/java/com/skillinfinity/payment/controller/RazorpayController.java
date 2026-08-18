package com.skillinfinity.payment.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.payment.dto.request.CreditPurchaseRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionCheckoutRequest;
import com.skillinfinity.payment.dto.request.RazorpaySubscriptionVerifyRequest;
import com.skillinfinity.payment.dto.request.RazorpayVerifyRequest;
import com.skillinfinity.payment.dto.response.CreditPackageResponse;
import com.skillinfinity.payment.dto.response.MySubscriptionResponse;
import com.skillinfinity.payment.dto.response.PaymentResponse;
import com.skillinfinity.payment.dto.response.RazorpayOrderResponse;
import com.skillinfinity.payment.dto.response.RazorpaySubscriptionCheckoutResponse;
import com.skillinfinity.payment.service.CreditPackageService;
import com.skillinfinity.payment.service.RazorpayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Razorpay (TEST MODE) endpoints for credit purchases and subscriptions.
 *
 * <p>The webhook endpoint is intentionally unauthenticated at the gateway
 * level — its security comes from the Razorpay webhook signature, which the
 * service verifies before processing anything.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Razorpay", description = "Razorpay credit purchases, subscriptions and webhooks (INR, test mode)")
public class RazorpayController {

    private final RazorpayService razorpayService;
    private final CreditPackageService creditPackageService;

    @GetMapping("/credit-packages")
    @Operation(summary = "List credit packages", description = "Backend-controlled credit packs with INR pricing")
    public ResponseEntity<ApiResponse<List<CreditPackageResponse>>> getCreditPackages() {
        return ResponseEntity.ok(ApiResponse.success(creditPackageService.getActivePackages()));
    }

    @PostMapping("/orders")
    @Operation(summary = "Create Razorpay order", description = "Creates a Razorpay order for a credit package — the backend resolves the price")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createOrder(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CreditPurchaseRequest request) {
        log.info("Create Razorpay order: userId={}, package={}", userId, request.getPackageCode());
        RazorpayOrderResponse response = razorpayService.createCreditOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Razorpay order created", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment", description = "Verifies the Razorpay signature server-side and credits the wallet (idempotent)")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody RazorpayVerifyRequest request) {
        log.info("Verify Razorpay payment: userId={}, paymentId={}", userId, request.getPaymentId());
        PaymentResponse response = razorpayService.verifyCreditPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/subscription/checkout")
    @Operation(summary = "Create Razorpay subscription checkout", description = "Creates a recurring Razorpay subscription for a plan")
    public ResponseEntity<ApiResponse<RazorpaySubscriptionCheckoutResponse>> createSubscriptionCheckout(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader,
            @Valid @RequestBody RazorpaySubscriptionCheckoutRequest request) {
        log.info("Create Razorpay subscription checkout: userId={}, planId={}", userId, request.getPlanId());
        RazorpaySubscriptionCheckoutResponse response = razorpayService.createSubscriptionCheckout(
                userId, parseRoles(rolesHeader), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription checkout created", response));
    }

    @PostMapping("/subscription/verify")
    @Operation(summary = "Verify subscription payment", description = "Verifies the first subscription charge and activates the plan (idempotent)")
    public ResponseEntity<ApiResponse<MySubscriptionResponse>> verifySubscription(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody RazorpaySubscriptionVerifyRequest request) {
        log.info("Verify subscription payment: userId={}, paymentId={}", userId, request.getPaymentId());
        MySubscriptionResponse response = razorpayService.verifySubscriptionPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription activated", response));
    }

    @PostMapping("/webhook/razorpay")
    @Operation(summary = "Razorpay webhook", description = "Signature-verified webhook for payment and subscription events")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        log.info("Razorpay webhook received: bytes={}", payload == null ? 0 : payload.length());
        razorpayService.handleWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed", null));
    }

    private Set<String> parseRoles(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
}

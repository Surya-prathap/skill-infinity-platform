package com.skillinfinity.session.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.common.filter.GatewayHeaderAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Thin client for the mentor-service. Used during the professional booking
 * lifecycle so the session-service can enforce, server-side, that the learner
 * booked a slot the mentor actually offers:
 *
 * <ul>
 *   <li>mentor exists, is verified and active (ACTIVE status)</li>
 *   <li>the selected session type/duration maps to a configured pricing plan</li>
 *   <li>the requested date/time falls inside the mentor's configured
 *       availability windows</li>
 * </ul>
 *
 * The booking cost is always computed from the mentor's pricing — the learner's
 * wallet never trusts a credit amount sent by the frontend.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MentorClient {

    private final RestTemplate restTemplate;

    @Value("${app.services.mentor-service-url:http://mentor-service:8083}")
    private String mentorServiceUrl;

    public MentorInfo getMentor(UUID mentorId) {
        MentorEnvelope envelope = exchange(mentorPath("/api/v1/mentors/{id}"), mentorId, MentorEnvelope.class);
        if (envelope == null || envelope.getData() == null) {
            throw new BadRequestException("Mentor not found: " + mentorId);
        }
        return envelope.getData();
    }

    /**
     * Resolves an authenticated user id to the mentor entity id, or returns
     * null when the user has no mentor profile. Used to bridge the gateway's
     * X-User-ID header (a user id) to bookings/sessions that store the mentor
     * entity id.
     */
    public UUID getMentorIdByUserId(UUID userId) {
        try {
            MentorEnvelope envelope = exchangeUser(mentorPath("/api/v1/mentors/profile"), userId, MentorEnvelope.class);
            return envelope == null || envelope.getData() == null ? null : envelope.getData().id();
        } catch (BadRequestException e) {
            // 404 from mentor-service: this user is not a mentor.
            return null;
        }
    }

    public List<PricingInfo> getPricing(UUID mentorId) {
        PricingEnvelope envelope = exchange(mentorPath("/api/v1/mentors/{id}/pricing"), mentorId, PricingEnvelope.class);
        return envelope == null || envelope.getData() == null ? List.of() : envelope.getData();
    }

    public List<AvailabilityInfo> getAvailability(UUID mentorId) {
        AvailabilityEnvelope envelope = exchange(mentorPath("/api/v1/mentors/{id}/availability"), mentorId, AvailabilityEnvelope.class);
        return envelope == null || envelope.getData() == null ? List.of() : envelope.getData();
    }

    private String mentorPath(String path) {
        String base = mentorServiceUrl.endsWith("/") ? mentorServiceUrl.substring(0, mentorServiceUrl.length() - 1) : mentorServiceUrl;
        return base + path;
    }

    /** GET an endpoint that takes the caller's user id in the X-User-ID header. */
    private <T> T exchangeUser(String url, UUID userId, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, userId.toString());
        headers.set(GatewayHeaderAuthenticationFilter.USER_ROLES_HEADER, "ROLE_USER");
        try {
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), responseType);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new BadRequestException("Mentor not found: " + userId);
            }
            log.warn("Mentor-service rejected profile lookup: userId={}, status={}", userId, e.getStatusCode());
            throw new ServiceException("Mentor service rejected the request", HttpStatus.BAD_REQUEST);
        } catch (RestClientException e) {
            log.error("Mentor-service unreachable during profile lookup: userId={}", userId, e);
            throw new ServiceException("Mentor service is unavailable. Please try again.", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private <T> T exchange(String url, UUID mentorId, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, "00000000-0000-0000-0000-000000000000");
        headers.set(GatewayHeaderAuthenticationFilter.USER_ROLES_HEADER, "ROLE_SYSTEM");

        try {
            ResponseEntity<T> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), responseType, mentorId);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new BadRequestException("Mentor not found: " + mentorId);
            }
            log.warn("Mentor-service rejected request: mentorId={}, status={}", mentorId, e.getStatusCode());
            throw new ServiceException("Mentor service rejected the request", HttpStatus.BAD_REQUEST);
        } catch (RestClientException e) {
            log.error("Mentor-service unreachable: mentorId={}", mentorId, e);
            throw new ServiceException("Booking could not be completed right now. Please try again.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    /** The shared ApiResponse envelope used by all Skill Infinity services. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Envelope<T> {
        private boolean success;
        private String message;
        private T data;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public T getData() {
            return data;
        }

        public void setData(T data) {
            this.data = data;
        }
    }

    /** Concrete envelopes so Jackson resolves the generic payload type. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MentorEnvelope extends Envelope<MentorInfo> {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PricingEnvelope extends Envelope<List<PricingInfo>> {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AvailabilityEnvelope extends Envelope<List<AvailabilityInfo>> {
    }

    /** Minimal mentor fields needed for booking validation. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MentorInfo(UUID id, UUID userId, String status, boolean verified) {
    }

    /** Minimal pricing fields used to compute the booking cost server-side. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PricingInfo(UUID id, String sessionType, BigDecimal price,
                              Integer durationMinutes, @JsonProperty("isFree") boolean isFree) {
    }

    /** Minimal availability fields used to validate the requested slot. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AvailabilityInfo(String dayOfWeek, String startTime, String endTime,
                                   String breakStartTime, String breakEndTime,
                                   Integer slotDurationMinutes, boolean recurring,
                                   String specificDate, boolean active) {
    }
}

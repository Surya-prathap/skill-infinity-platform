package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.community.dto.request.PollRequest;
import com.skillinfinity.community.dto.request.VoteRequest;
import com.skillinfinity.community.dto.response.PollResponse;
import com.skillinfinity.community.service.PollService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/polls")
@RequiredArgsConstructor
@Tag(name = "Polls", description = "Poll creation and voting")
public class PollController {

    private final PollService pollService;

    @PostMapping
    @Operation(summary = "Create poll", description = "Creates a new poll attached to a post")
    public ResponseEntity<ApiResponse<PollResponse>> createPoll(
            @Valid @RequestBody PollRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        PollResponse response = pollService.createPoll(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Poll created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get poll", description = "Returns poll details with results")
    public ResponseEntity<ApiResponse<PollResponse>> getPoll(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        PollResponse response = pollService.getPoll(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/vote")
    @Operation(summary = "Vote on poll", description = "Votes on a poll option")
    public ResponseEntity<ApiResponse<Void>> vote(
            @Valid @RequestBody VoteRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        pollService.vote(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Vote recorded", null));
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null) {
            return UUID.randomUUID();
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return UUID.randomUUID();
        }
    }
}

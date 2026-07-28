package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.request.PollRequest;
import com.skillinfinity.community.dto.request.VoteRequest;
import com.skillinfinity.community.dto.response.PollResponse;

import java.util.UUID;

public interface PollService {

    PollResponse createPoll(PollRequest request, UUID authorId);

    PollResponse getPoll(UUID pollId, UUID currentUserId);

    void vote(VoteRequest request, UUID userId);
}

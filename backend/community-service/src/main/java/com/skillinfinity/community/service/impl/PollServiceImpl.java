package com.skillinfinity.community.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.community.dto.request.PollRequest;
import com.skillinfinity.community.dto.request.VoteRequest;
import com.skillinfinity.community.dto.response.PollOptionResponse;
import com.skillinfinity.community.dto.response.PollResponse;
import com.skillinfinity.community.entity.Poll;
import com.skillinfinity.community.entity.PollOption;
import com.skillinfinity.community.entity.PollVote;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.exception.AlreadyVotedException;
import com.skillinfinity.community.exception.PollExpiredException;
import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.PollOptionRepository;
import com.skillinfinity.community.repository.PollRepository;
import com.skillinfinity.community.repository.PollVoteRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.PollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PollServiceImpl implements PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final PostRepository postRepository;
    private final CommunityMapper mapper;

    @Override
    public PollResponse createPoll(PollRequest request, UUID authorId) {
        log.info("Creating poll for post: {} by user: {}", request.getPostId(), authorId);

        Post post = postRepository.findByIdAndActiveTrue(request.getPostId())
                .orElseThrow(() -> new PostNotFoundException(request.getPostId().toString()));

        if (request.getOptions().size() < 2) {
            throw new BadRequestException("Poll must have at least 2 options");
        }

        if (request.getOptions().size() > 10) {
            throw new BadRequestException("Poll cannot have more than 10 options");
        }

        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiration date must be in the future");
        }

        Poll poll = Poll.builder()
                .id(UUID.randomUUID())
                .post(post)
                .question(request.getQuestion())
                .multipleChoice(request.isMultipleChoice())
                .expiresAt(request.getExpiresAt())
                .build();

        List<PollOption> options = new ArrayList<>();
        for (int i = 0; i < request.getOptions().size(); i++) {
            PollOption option = PollOption.builder()
                    .id(UUID.randomUUID())
                    .poll(poll)
                    .text(request.getOptions().get(i))
                    .sortOrder(i)
                    .build();
            options.add(option);
        }
        poll.setOptions(options);

        poll = pollRepository.save(poll);

        log.info("Poll created successfully: {}", poll.getId());
        return mapper.toPollResponse(poll);
    }

    @Override
    @Transactional(readOnly = true)
    public PollResponse getPoll(UUID pollId, UUID currentUserId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new BadRequestException("Poll not found: " + pollId));

        PollResponse response = mapper.toPollResponse(poll);

        // Check if expired
        boolean expired = poll.getExpiresAt() != null && poll.getExpiresAt().isBefore(LocalDateTime.now());
        response.setExpired(expired);

        // Check if current user voted
        if (currentUserId != null) {
            response.setVotedByMe(pollVoteRepository.existsByPollIdAndUserIdAndActiveTrue(pollId, currentUserId));
        }

        // Calculate percentages
        int totalVotes = poll.getTotalVotes();
        if (totalVotes > 0 && response.getOptions() != null) {
            for (PollOptionResponse optionResp : response.getOptions()) {
                double percentage = (double) optionResp.getVoteCount() / totalVotes * 100;
                optionResp.setPercentage(Math.round(percentage * 10.0) / 10.0);
            }
        }

        return response;
    }

    @Override
    public void vote(VoteRequest request, UUID userId) {
        log.info("User {} voting on poll: {}", userId, request.getPollId());

        Poll poll = pollRepository.findById(request.getPollId())
                .orElseThrow(() -> new BadRequestException("Poll not found: " + request.getPollId()));

        // Check if poll is expired
        if (poll.getExpiresAt() != null && poll.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new PollExpiredException();
        }

        // Check duplicate vote
        if (!poll.isMultipleChoice() && pollVoteRepository.existsByPollIdAndUserIdAndActiveTrue(request.getPollId(), userId)) {
            throw new AlreadyVotedException();
        }

        // Check option exists
        PollOption option = pollOptionRepository.findByIdAndPollIdAndActiveTrue(request.getOptionId(), request.getPollId())
                .orElseThrow(() -> new BadRequestException("Poll option not found"));

        // Check duplicate option vote
        if (pollVoteRepository.existsByPollIdAndUserIdAndOptionIdAndActiveTrue(
                request.getPollId(), userId, request.getOptionId())) {
            throw new BadRequestException("You have already voted for this option");
        }

        PollVote vote = PollVote.builder()
                .id(UUID.randomUUID())
                .poll(poll)
                .option(option)
                .userId(userId)
                .build();

        pollVoteRepository.save(vote);

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        poll.setTotalVotes(poll.getTotalVotes() + 1);
        pollRepository.save(poll);

        log.info("User {} voted on poll {}", userId, request.getPollId());
    }
}

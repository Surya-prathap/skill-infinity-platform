package com.skillinfinity.community.service;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.community.dto.request.PollRequest;
import com.skillinfinity.community.dto.request.VoteRequest;
import com.skillinfinity.community.dto.response.PollResponse;
import com.skillinfinity.community.entity.Poll;
import com.skillinfinity.community.entity.PollOption;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.enumeration.PostStatus;
import com.skillinfinity.community.enumeration.PostType;
import com.skillinfinity.community.exception.AlreadyVotedException;
import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.PollOptionRepository;
import com.skillinfinity.community.repository.PollRepository;
import com.skillinfinity.community.repository.PollVoteRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.impl.PollServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PollServiceTest {

    @Mock
    private PollRepository pollRepository;
    @Mock
    private PollOptionRepository pollOptionRepository;
    @Mock
    private PollVoteRepository pollVoteRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private CommunityMapper mapper;

    private PollService pollService;
    private UUID userId;
    private UUID postId;
    private UUID pollId;
    private UUID optionId;
    private Post post;
    private Poll poll;
    private PollOption option;

    @BeforeEach
    void setUp() {
        pollService = new PollServiceImpl(pollRepository, pollOptionRepository,
                pollVoteRepository, postRepository, mapper);

        userId = UUID.randomUUID();
        postId = UUID.randomUUID();
        pollId = UUID.randomUUID();
        optionId = UUID.randomUUID();

        post = Post.builder()
                .id(postId)
                .title("Test Post")
                .content("Content")
                .postType(PostType.DISCUSSION)
                .status(PostStatus.PUBLISHED)
                .authorId(userId)
                .active(true)
                .build();

        poll = Poll.builder()
                .id(pollId)
                .post(post)
                .question("Test question?")
                .totalVotes(0)
                .active(true)
                .build();

        option = PollOption.builder()
                .id(optionId)
                .poll(poll)
                .text("Option 1")
                .voteCount(0)
                .active(true)
                .build();
    }

    @Test
    void createPoll_ShouldCreateSuccessfully() {
        PollRequest request = PollRequest.builder()
                .postId(postId)
                .question("Test question?")
                .options(List.of("Option 1", "Option 2"))
                .build();

        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));
        when(pollRepository.save(any(Poll.class))).thenReturn(poll);
        when(mapper.toPollResponse(any(Poll.class))).thenReturn(
                PollResponse.builder().id(pollId).question("Test question?").build());

        PollResponse response = pollService.createPoll(request, userId);

        assertNotNull(response);
        assertEquals(pollId, response.getId());
        verify(pollRepository).save(any(Poll.class));
    }

    @Test
    void createPoll_ShouldThrowException_WhenPostNotFound() {
        PollRequest request = PollRequest.builder()
                .postId(postId)
                .question("Test?")
                .options(List.of("Option 1", "Option 2"))
                .build();

        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.empty());

        assertThrows(PostNotFoundException.class, () -> pollService.createPoll(request, userId));
    }

    @Test
    void createPoll_ShouldThrowException_WhenNotEnoughOptions() {
        PollRequest request = PollRequest.builder()
                .postId(postId)
                .question("Test?")
                .options(List.of("Option 1"))
                .build();

        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));

        assertThrows(BadRequestException.class, () -> pollService.createPoll(request, userId));
    }

    @Test
    void getPoll_ShouldReturnPoll() {
        when(pollRepository.findById(pollId)).thenReturn(Optional.of(poll));
        when(mapper.toPollResponse(any(Poll.class))).thenReturn(
                PollResponse.builder().id(pollId).question("Test?").build());

        PollResponse response = pollService.getPoll(pollId, userId);

        assertNotNull(response);
        assertEquals(pollId, response.getId());
    }

    @Test
    void vote_ShouldRecordVote() {
        VoteRequest request = VoteRequest.builder()
                .pollId(pollId)
                .optionId(optionId)
                .build();

        when(pollRepository.findById(pollId)).thenReturn(Optional.of(poll));
        when(pollVoteRepository.existsByPollIdAndUserIdAndActiveTrue(pollId, userId))
                .thenReturn(false);
        when(pollOptionRepository.findByIdAndPollIdAndActiveTrue(optionId, pollId))
                .thenReturn(Optional.of(option));
        when(pollVoteRepository.existsByPollIdAndUserIdAndOptionIdAndActiveTrue(
                pollId, userId, optionId)).thenReturn(false);

        pollService.vote(request, userId);

        assertEquals(1, option.getVoteCount());
        assertEquals(1, poll.getTotalVotes());
        verify(pollOptionRepository).save(option);
        verify(pollRepository).save(poll);
    }

    @Test
    void vote_ShouldThrowException_WhenAlreadyVoted() {
        VoteRequest request = VoteRequest.builder()
                .pollId(pollId)
                .optionId(optionId)
                .build();

        when(pollRepository.findById(pollId)).thenReturn(Optional.of(poll));
        when(pollVoteRepository.existsByPollIdAndUserIdAndActiveTrue(pollId, userId))
                .thenReturn(true);

        assertThrows(AlreadyVotedException.class, () -> pollService.vote(request, userId));
    }
}

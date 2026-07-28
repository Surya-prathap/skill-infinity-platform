package com.skillinfinity.community.service;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.community.dto.request.PostRequest;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.entity.Like;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.enumeration.PostStatus;
import com.skillinfinity.community.enumeration.PostType;
import com.skillinfinity.community.event.CommunityEventPublisher;
import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.BookmarkRepository;
import com.skillinfinity.community.repository.CommunityRepository;
import com.skillinfinity.community.repository.LikeRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.impl.PostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private BookmarkRepository bookmarkRepository;
    @Mock
    private CommunityMapper mapper;
    @Mock
    private CommunityEventPublisher eventPublisher;

    private PostService postService;
    private UUID userId;
    private UUID postId;
    private Post post;

    @BeforeEach
    void setUp() {
        postService = new PostServiceImpl(postRepository, communityRepository, likeRepository,
                bookmarkRepository, mapper, eventPublisher);

        userId = UUID.randomUUID();
        postId = UUID.randomUUID();

        post = Post.builder()
                .id(postId)
                .title("Test Post")
                .content("Test content")
                .postType(PostType.DISCUSSION)
                .status(PostStatus.PUBLISHED)
                .authorId(userId)
                .active(true)
                .likeCount(0)
                .commentCount(0)
                .viewCount(0)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createPost_ShouldCreateSuccessfully() {
        PostRequest request = PostRequest.builder()
                .title("New Post")
                .content("Content")
                .postType("DISCUSSION")
                .status("PUBLISHED")
                .build();

        when(postRepository.save(any(Post.class))).thenReturn(post);
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).title("New Post").build());

        PostResponse response = postService.createPost(request, userId);

        assertNotNull(response);
        assertEquals(postId, response.getId());
        verify(postRepository).save(any(Post.class));
        verify(eventPublisher).publishPostCreated(any());
    }

    @Test
    void getPost_ShouldReturnPost() {
        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).title("Test Post").build());

        PostResponse response = postService.getPost(postId, userId);

        assertNotNull(response);
        assertEquals(postId, response.getId());
    }

    @Test
    void getPost_ShouldThrowException_WhenNotFound() {
        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.empty());

        assertThrows(PostNotFoundException.class, () -> postService.getPost(postId, userId));
    }

    @Test
    void updatePost_ShouldUpdateSuccessfully() {
        PostRequest request = PostRequest.builder()
                .title("Updated Title")
                .content("Updated content")
                .build();

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenReturn(post);
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).title("Updated Title").build());

        PostResponse response = postService.updatePost(postId, request, userId);

        assertNotNull(response);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void updatePost_ShouldThrowException_WhenNotOwner() {
        UUID otherUserId = UUID.randomUUID();
        PostRequest request = PostRequest.builder().title("Updated").build();

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        assertThrows(ForbiddenException.class,
                () -> postService.updatePost(postId, request, otherUserId));
    }

    @Test
    void deletePost_ShouldSoftDelete() {
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        postService.deletePost(postId, userId);

        assertFalse(post.isActive());
        assertNotNull(post.getArchivedAt());
        assertEquals(PostStatus.ARCHIVED, post.getStatus());
        verify(postRepository).save(post);
    }

    @Test
    void likePost_ShouldIncrementCount() {
        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));
        when(likeRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId)).thenReturn(false);
        when(likeRepository.save(any(Like.class))).thenReturn(mock(Like.class));

        postService.likePost(postId, userId);

        assertEquals(1, post.getLikeCount());
        verify(postRepository).save(post);
    }

    @Test
    void likePost_ShouldThrowException_WhenAlreadyLiked() {
        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));
        when(likeRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> postService.likePost(postId, userId));
    }

    @Test
    void searchPosts_ShouldReturnResults() {
        Page<Post> postPage = new PageImpl<>(List.of(post));

        when(postRepository.searchPosts(eq("test"), any(PageRequest.class))).thenReturn(postPage);
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).build());

        Page<PostResponse> results = postService.searchPosts("test", 0, 20, userId);

        assertNotNull(results);
        assertEquals(1, results.getTotalElements());
    }

    @Test
    void getTrendingPosts_ShouldReturnList() {
        when(postRepository.findTrendingSince(any(), any(PageRequest.class))).thenReturn(List.of(post));
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).build());

        List<PostResponse> results = postService.getTrendingPosts(10);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void incrementViewCount_ShouldIncreaseCount() {
        when(postRepository.findByIdAndActiveTrue(postId)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenReturn(post);
        when(mapper.toPostResponse(any(Post.class))).thenReturn(
                PostResponse.builder().id(postId).viewCount(1).build());

        PostResponse response = postService.incrementViewCount(postId);

        assertNotNull(response);
        assertEquals(1, post.getViewCount());
    }
}

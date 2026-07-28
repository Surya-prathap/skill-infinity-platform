package com.skillinfinity.community.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.community.dto.request.PostRequest;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.entity.Bookmark;
import com.skillinfinity.community.entity.Community;
import com.skillinfinity.community.entity.Like;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.enumeration.PostStatus;
import com.skillinfinity.community.enumeration.PostType;
import com.skillinfinity.community.event.CommunityEventPublisher;
import com.skillinfinity.community.event.CommunityPostCreatedEvent;
import com.skillinfinity.community.exception.CommunityNotFoundException;
import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.BookmarkRepository;
import com.skillinfinity.community.repository.CommunityRepository;
import com.skillinfinity.community.repository.LikeRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final CommunityMapper mapper;
    private final CommunityEventPublisher eventPublisher;

    @Override
    @CacheEvict(value = {"trendingPosts", "popularTags"}, allEntries = true)
    public PostResponse createPost(PostRequest request, UUID authorId) {
        log.info("Creating post: {} by user: {}", request.getTitle(), authorId);

        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> new CommunityNotFoundException(request.getCommunityId().toString()));
        }

        PostType postType = PostType.DISCUSSION;
        if (request.getPostType() != null) {
            try {
                postType = PostType.valueOf(request.getPostType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid post type: " + request.getPostType());
            }
        }

        PostStatus status = PostStatus.PUBLISHED;
        if (request.getStatus() != null) {
            try {
                status = PostStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid post status: " + request.getStatus());
            }
        }

        Post post = Post.builder()
                .id(UUID.randomUUID())
                .community(community)
                .title(request.getTitle())
                .content(request.getContent())
                .postType(postType)
                .status(status)
                .authorId(authorId)
                .tags(request.getTags())
                .pinned(request.isPinned())
                .createdBy(authorId.toString())
                .updatedBy(authorId.toString())
                .build();

        if (status == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }

        post = postRepository.save(post);

        if (community != null) {
            community.setPostCount(community.getPostCount() + 1);
            communityRepository.save(community);
        }

        // Publish event
        eventPublisher.publishPostCreated(CommunityPostCreatedEvent.builder()
                .eventId(UUID.randomUUID())
                .postId(post.getId())
                .communityId(community != null ? community.getId() : null)
                .authorId(authorId)
                .title(post.getTitle())
                .postType(postType.name())
                .timestamp(LocalDateTime.now())
                .build());

        log.info("Post created successfully: {}", post.getId());
        return mapper.toPostResponse(post);
    }

    @Override
    @CacheEvict(value = {"trendingPosts"}, allEntries = true)
    public PostResponse updatePost(UUID postId, PostRequest request, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        if (!post.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        if (request.getPostType() != null) {
            try {
                post.setPostType(PostType.valueOf(request.getPostType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid post type: " + request.getPostType());
            }
        }
        if (request.getStatus() != null) {
            try {
                PostStatus newStatus = PostStatus.valueOf(request.getStatus().toUpperCase());
                post.setStatus(newStatus);
                if (newStatus == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
                    post.setPublishedAt(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid post status: " + request.getStatus());
            }
        }
        post.setUpdatedBy(userId.toString());

        post = postRepository.save(post);
        log.info("Post updated: {}", postId);
        return mapper.toPostResponse(post);
    }

    @Override
    @CacheEvict(value = {"trendingPosts"}, allEntries = true)
    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        if (!post.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        post.setActive(false);
        post.setArchivedAt(LocalDateTime.now());
        post.setUpdatedBy(userId.toString());
        post.setStatus(PostStatus.ARCHIVED);
        postRepository.save(post);

        if (post.getCommunity() != null) {
            Community community = post.getCommunity();
            community.setPostCount(Math.max(0, community.getPostCount() - 1));
            communityRepository.save(community);
        }

        log.info("Post deleted: {}", postId);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(UUID postId, UUID currentUserId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        PostResponse response = mapper.toPostResponse(post);
        populateUserInteraction(response, postId, currentUserId);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByCommunity(UUID communityId, int page, int size, UUID currentUserId) {
        Page<Post> posts = postRepository.findByCommunityIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                communityId, PostStatus.PUBLISHED, PageRequest.of(page, size));
        return posts.map(post -> {
            PostResponse response = mapper.toPostResponse(post);
            populateUserInteraction(response, post.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUser(UUID authorId, int page, int size, UUID currentUserId) {
        Page<Post> posts = postRepository.findByAuthorIdAndActiveTrueOrderByCreatedAtDesc(
                authorId, PageRequest.of(page, size));
        return posts.map(post -> {
            PostResponse response = mapper.toPostResponse(post);
            populateUserInteraction(response, post.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(String query, int page, int size, UUID currentUserId) {
        Page<Post> posts = postRepository.searchPosts(query, PageRequest.of(page, size));
        return posts.map(post -> {
            PostResponse response = mapper.toPostResponse(post);
            populateUserInteraction(response, post.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByTag(String tag, int page, int size, UUID currentUserId) {
        Page<Post> posts = postRepository.findByTag(tag, PageRequest.of(page, size));
        return posts.map(post -> {
            PostResponse response = mapper.toPostResponse(post);
            populateUserInteraction(response, post.getId(), currentUserId);
            return response;
        });
    }

    @Override
    public void likePost(UUID postId, UUID userId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        if (likeRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId)) {
            throw new BadRequestException("You have already liked this post");
        }

        Like like = Like.builder()
                .id(UUID.randomUUID())
                .post(post)
                .userId(userId)
                .build();

        likeRepository.save(like);
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
        log.debug("User {} liked post {}", userId, postId);
    }

    @Override
    public void unlikePost(UUID postId, UUID userId) {
        Like like = likeRepository.findByPostIdAndUserIdAndActiveTrue(postId, userId)
                .orElseThrow(() -> new BadRequestException("You have not liked this post"));

        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        like.setActive(false);
        likeRepository.save(like);
        post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        postRepository.save(post);
        log.debug("User {} unliked post {}", userId, postId);
    }

    @Override
    public void bookmarkPost(UUID postId, UUID userId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        if (bookmarkRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId)) {
            throw new BadRequestException("You have already bookmarked this post");
        }

        Bookmark bookmark = Bookmark.builder()
                .id(UUID.randomUUID())
                .post(post)
                .userId(userId)
                .build();

        bookmarkRepository.save(bookmark);
        post.setBookmarkCount(post.getBookmarkCount() + 1);
        postRepository.save(post);
        log.debug("User {} bookmarked post {}", userId, postId);
    }

    @Override
    public void unbookmarkPost(UUID postId, UUID userId) {
        Bookmark bookmark = bookmarkRepository.findByPostIdAndUserIdAndActiveTrue(postId, userId)
                .orElseThrow(() -> new BadRequestException("You have not bookmarked this post"));

        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        bookmark.setActive(false);
        bookmarkRepository.save(bookmark);
        post.setBookmarkCount(Math.max(0, post.getBookmarkCount() - 1));
        postRepository.save(post);
        log.debug("User {} unbookmarked post {}", userId, postId);
    }

    @Override
    public void togglePinPost(UUID postId, UUID communityId, UUID userId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));

        post.setPinned(!post.isPinned());
        postRepository.save(post);
        log.info("Post {} pin toggled to {} by user {}", postId, post.isPinned(), userId);
    }

    @Override
    public PostResponse incrementViewCount(UUID postId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new PostNotFoundException(postId.toString()));
        post.setViewCount(post.getViewCount() + 1);
        post = postRepository.save(post);
        return mapper.toPostResponse(post);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "trendingPosts", key = "'trending_' + #limit")
    public List<PostResponse> getTrendingPosts(int limit) {
        LocalDateTime since = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        List<Post> posts = postRepository.findTrendingSince(since, PageRequest.of(0, limit));
        return posts.stream().map(mapper::toPostResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPinnedPosts(UUID communityId) {
        List<Post> posts;
        if (communityId != null) {
            posts = postRepository.findPinnedPostsByCommunityId(communityId);
        } else {
            posts = postRepository.findPinnedPosts();
        }
        return posts.stream().map(mapper::toPostResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "trendingPosts", key = "'popular_' + #limit")
    public List<PostResponse> getPopularPosts(int limit) {
        List<Post> posts = postRepository.findPopularPosts(PageRequest.of(0, limit));
        return posts.stream().map(mapper::toPostResponse).toList();
    }

    private void populateUserInteraction(PostResponse response, UUID postId, UUID userId) {
        if (userId != null) {
            response.setLikedByMe(likeRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId));
            response.setBookmarkedByMe(bookmarkRepository.existsByPostIdAndUserIdAndActiveTrue(postId, userId));
        }
    }
}

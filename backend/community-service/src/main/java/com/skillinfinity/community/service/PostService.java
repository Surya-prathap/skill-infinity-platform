package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.request.PostRequest;
import com.skillinfinity.community.dto.response.PostResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface PostService {

    PostResponse createPost(PostRequest request, UUID authorId);

    PostResponse updatePost(UUID postId, PostRequest request, UUID userId);

    void deletePost(UUID postId, UUID userId);

    PostResponse getPost(UUID postId, UUID currentUserId);

    Page<PostResponse> getPostsByCommunity(UUID communityId, int page, int size, UUID currentUserId);

    Page<PostResponse> getPostsByUser(UUID authorId, int page, int size, UUID currentUserId);

    Page<PostResponse> searchPosts(String query, int page, int size, UUID currentUserId);

    Page<PostResponse> getPostsByTag(String tag, int page, int size, UUID currentUserId);

    void likePost(UUID postId, UUID userId);

    void unlikePost(UUID postId, UUID userId);

    void bookmarkPost(UUID postId, UUID userId);

    void unbookmarkPost(UUID postId, UUID userId);

    void togglePinPost(UUID postId, UUID communityId, UUID userId);

    PostResponse incrementViewCount(UUID postId);

    List<PostResponse> getTrendingPosts(int limit);

    List<PostResponse> getPinnedPosts(UUID communityId);

    List<PostResponse> getPopularPosts(int limit);
}

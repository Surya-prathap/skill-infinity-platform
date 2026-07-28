package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import org.springframework.data.domain.Page;

public interface SearchService {

    Page<PostResponse> searchPosts(String query, String tag, String sortBy, int page, int size, java.util.UUID currentUserId);

    Page<CommunityResponse> searchCommunities(String query, int page, int size, java.util.UUID currentUserId);
}

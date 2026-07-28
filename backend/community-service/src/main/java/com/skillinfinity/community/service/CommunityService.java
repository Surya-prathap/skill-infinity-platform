package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.request.CommunityRequest;
import com.skillinfinity.community.dto.response.CommunityResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface CommunityService {

    CommunityResponse createCommunity(CommunityRequest request, UUID userId);

    CommunityResponse updateCommunity(UUID communityId, CommunityRequest request, UUID userId);

    void deleteCommunity(UUID communityId, UUID userId);

    CommunityResponse getCommunity(UUID communityId, UUID currentUserId);

    CommunityResponse getCommunityBySlug(String slug, UUID currentUserId);

    Page<CommunityResponse> getCommunities(int page, int size, UUID currentUserId);

    Page<CommunityResponse> searchCommunities(String query, int page, int size, UUID currentUserId);

    Page<CommunityResponse> getUserCommunities(UUID userId, int page, int size, UUID currentUserId);

    void joinCommunity(UUID communityId, UUID userId);

    void leaveCommunity(UUID communityId, UUID userId);

    boolean isMember(UUID communityId, UUID userId);
}

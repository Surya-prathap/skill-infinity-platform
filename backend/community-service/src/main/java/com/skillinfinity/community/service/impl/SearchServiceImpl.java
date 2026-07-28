package com.skillinfinity.community.service.impl;

import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.CommunityRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMapper mapper;

    @Override
    public Page<PostResponse> searchPosts(String query, String tag, String sortBy, int page, int size, UUID currentUserId) {
        PageRequest pageRequest = PageRequest.of(page, size);
        if (tag != null && !tag.isBlank()) {
            return postRepository.findByTag(tag, pageRequest)
                    .map(mapper::toPostResponse);
        }
        return postRepository.searchPosts(query, pageRequest)
                .map(mapper::toPostResponse);
    }

    @Override
    public Page<CommunityResponse> searchCommunities(String query, int page, int size, UUID currentUserId) {
        return communityRepository.searchCommunities(query, PageRequest.of(page, size))
                .map(community -> {
                    CommunityResponse response = mapper.toCommunityResponse(community);
                    if (currentUserId != null) {
                        response.setMember(
                            community.getMembers().stream()
                                .anyMatch(m -> m.getUserId().equals(currentUserId) && m.isActive())
                        );
                    }
                    return response;
                });
    }
}

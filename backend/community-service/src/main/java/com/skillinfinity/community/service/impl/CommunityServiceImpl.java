package com.skillinfinity.community.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.community.dto.request.CommunityRequest;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.entity.Community;
import com.skillinfinity.community.entity.CommunityMember;
import com.skillinfinity.community.enumeration.CommunityVisibility;
import com.skillinfinity.community.enumeration.MembershipRole;
import com.skillinfinity.community.exception.CommunityNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.CommunityMemberRepository;
import com.skillinfinity.community.repository.CommunityRepository;
import com.skillinfinity.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository memberRepository;
    private final CommunityMapper mapper;

    @Override
    @CacheEvict(value = {"popularCommunities", "trendingPosts"}, allEntries = true)
    public CommunityResponse createCommunity(CommunityRequest request, UUID userId) {
        log.info("Creating community: {} by user: {}", request.getName(), userId);

        CommunityVisibility visibility = CommunityVisibility.PUBLIC;
        if (request.getVisibility() != null) {
            try {
                visibility = CommunityVisibility.valueOf(request.getVisibility().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid visibility: " + request.getVisibility());
            }
        }

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = request.getName().toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", "");
        }

        Community community = Community.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .description(request.getDescription())
                .slug(slug)
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .visibility(visibility)
                .ownerId(userId)
                .rules(request.getRules())
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        community = communityRepository.save(community);

        // Add owner as admin member
        CommunityMember owner = CommunityMember.builder()
                .id(UUID.randomUUID())
                .community(community)
                .userId(userId)
                .role(MembershipRole.ADMIN)
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        memberRepository.save(owner);
        community.setMemberCount(1);

        log.info("Community created successfully: {}", community.getId());
        return mapper.toCommunityResponse(community);
    }

    @Override
    @CacheEvict(value = {"popularCommunities"}, allEntries = true)
    public CommunityResponse updateCommunity(UUID communityId, CommunityRequest request, UUID userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException(communityId.toString()));

        if (!community.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Only the owner can update this community");
        }

        if (request.getName() != null) {
            community.setName(request.getName());
        }
        if (request.getDescription() != null) {
            community.setDescription(request.getDescription());
        }
        if (request.getAvatarUrl() != null) {
            community.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getCoverUrl() != null) {
            community.setCoverUrl(request.getCoverUrl());
        }
        if (request.getRules() != null) {
            community.setRules(request.getRules());
        }
        if (request.getVisibility() != null) {
            try {
                community.setVisibility(CommunityVisibility.valueOf(request.getVisibility().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid visibility: " + request.getVisibility());
            }
        }
        community.setUpdatedBy(userId.toString());

        community = communityRepository.save(community);
        log.info("Community updated: {}", communityId);
        return mapper.toCommunityResponse(community);
    }

    @Override
    @CacheEvict(value = {"popularCommunities"}, allEntries = true)
    public void deleteCommunity(UUID communityId, UUID userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException(communityId.toString()));

        if (!community.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Only the owner can delete this community");
        }

        community.setActive(false);
        community.setUpdatedBy(userId.toString());
        communityRepository.save(community);
        log.info("Community deleted: {}", communityId);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunity(UUID communityId, UUID currentUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException(communityId.toString()));

        CommunityResponse response = mapper.toCommunityResponse(community);
        if (currentUserId != null) {
            populateMembershipInfo(response, communityId, currentUserId);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityBySlug(String slug, UUID currentUserId) {
        Community community = communityRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new CommunityNotFoundException(slug));

        CommunityResponse response = mapper.toCommunityResponse(community);
        if (currentUserId != null) {
            populateMembershipInfo(response, community.getId(), currentUserId);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "popularCommunities", key = "'all_' + #page + '_' + #size")
    public Page<CommunityResponse> getCommunities(int page, int size, UUID currentUserId) {
        Page<Community> communities = communityRepository.findByActiveTrueOrderByMemberCountDesc(
                PageRequest.of(page, size));
        return communities.map(community -> {
            CommunityResponse response = mapper.toCommunityResponse(community);
            if (currentUserId != null) {
                populateMembershipInfo(response, community.getId(), currentUserId);
            }
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> searchCommunities(String query, int page, int size, UUID currentUserId) {
        Page<Community> communities = communityRepository.searchCommunities(query,
                PageRequest.of(page, size));
        return communities.map(community -> {
            CommunityResponse response = mapper.toCommunityResponse(community);
            if (currentUserId != null) {
                populateMembershipInfo(response, community.getId(), currentUserId);
            }
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommunityResponse> getUserCommunities(UUID userId, int page, int size, UUID currentUserId) {
        Page<Community> communities = communityRepository.findCommunitiesByMemberId(
                userId, PageRequest.of(page, size));
        return communities.map(community -> {
            CommunityResponse response = mapper.toCommunityResponse(community);
            if (currentUserId != null) {
                populateMembershipInfo(response, community.getId(), currentUserId);
            }
            return response;
        });
    }

    @Override
    @CacheEvict(value = {"popularCommunities"}, allEntries = true)
    public void joinCommunity(UUID communityId, UUID userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException(communityId.toString()));

        if (!community.isActive()) {
            throw new BadRequestException("This community is no longer active");
        }

        if (memberRepository.existsByCommunityIdAndUserIdAndActiveTrue(communityId, userId)) {
            throw new BadRequestException("You are already a member of this community");
        }

        CommunityMember member = CommunityMember.builder()
                .id(UUID.randomUUID())
                .community(community)
                .userId(userId)
                .role(MembershipRole.MEMBER)
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        memberRepository.save(member);
        community.setMemberCount(community.getMemberCount() + 1);
        communityRepository.save(community);

        log.info("User {} joined community {}", userId, communityId);
    }

    @Override
    @CacheEvict(value = {"popularCommunities"}, allEntries = true)
    public void leaveCommunity(UUID communityId, UUID userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException(communityId.toString()));

        CommunityMember member = memberRepository
                .findByCommunityIdAndUserIdAndActiveTrue(communityId, userId)
                .orElseThrow(() -> new BadRequestException("You are not a member of this community"));

        member.setActive(false);
        member.setUpdatedBy(userId.toString());
        memberRepository.save(member);
        community.setMemberCount(Math.max(0, community.getMemberCount() - 1));
        communityRepository.save(community);

        log.info("User {} left community {}", userId, communityId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isMember(UUID communityId, UUID userId) {
        return memberRepository.existsByCommunityIdAndUserIdAndActiveTrue(communityId, userId);
    }

    private void populateMembershipInfo(CommunityResponse response, UUID communityId, UUID userId) {
        memberRepository.findByCommunityIdAndUserIdAndActiveTrue(communityId, userId)
                .ifPresent(member -> {
                    response.setMember(true);
                    response.setMembershipRole(member.getRole().name());
                });
    }
}

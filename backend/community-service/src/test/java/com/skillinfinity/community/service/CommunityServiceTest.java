package com.skillinfinity.community.service;

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
import com.skillinfinity.community.service.impl.CommunityServiceImpl;
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
class CommunityServiceTest {

    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private CommunityMemberRepository memberRepository;
    @Mock
    private CommunityMapper mapper;

    private CommunityService communityService;
    private UUID userId;
    private UUID communityId;
    private Community community;
    private CommunityMember member;

    @BeforeEach
    void setUp() {
        communityService = new CommunityServiceImpl(communityRepository, memberRepository, mapper);

        userId = UUID.randomUUID();
        communityId = UUID.randomUUID();

        community = Community.builder()
                .id(communityId)
                .name("Test Community")
                .slug("test-community")
                .visibility(CommunityVisibility.PUBLIC)
                .ownerId(userId)
                .active(true)
                .memberCount(1)
                .createdAt(LocalDateTime.now())
                .build();

        member = CommunityMember.builder()
                .id(UUID.randomUUID())
                .community(community)
                .userId(userId)
                .role(MembershipRole.ADMIN)
                .active(true)
                .build();
    }

    @Test
    void createCommunity_ShouldCreateSuccessfully() {
        CommunityRequest request = CommunityRequest.builder()
                .name("New Community")
                .description("Description")
                .visibility("PUBLIC")
                .build();

        when(communityRepository.save(any(Community.class))).thenReturn(community);
        when(memberRepository.save(any(CommunityMember.class))).thenReturn(member);
        when(mapper.toCommunityResponse(any(Community.class))).thenReturn(
                CommunityResponse.builder().id(communityId).name("New Community").build());

        CommunityResponse response = communityService.createCommunity(request, userId);

        assertNotNull(response);
        assertEquals(communityId, response.getId());
        verify(communityRepository).save(any(Community.class));
        verify(memberRepository).save(any(CommunityMember.class));
    }

    @Test
    void getCommunity_ShouldReturnCommunity() {
        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(mapper.toCommunityResponse(any(Community.class))).thenReturn(
                CommunityResponse.builder().id(communityId).name("Test Community").build());

        CommunityResponse response = communityService.getCommunity(communityId, userId);

        assertNotNull(response);
        assertEquals(communityId, response.getId());
    }

    @Test
    void getCommunity_ShouldThrowException_WhenNotFound() {
        when(communityRepository.findById(communityId)).thenReturn(Optional.empty());

        assertThrows(CommunityNotFoundException.class,
                () -> communityService.getCommunity(communityId, userId));
    }

    @Test
    void updateCommunity_ShouldUpdateSuccessfully() {
        CommunityRequest request = CommunityRequest.builder()
                .name("Updated Community")
                .description("Updated description")
                .build();

        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(communityRepository.save(any(Community.class))).thenReturn(community);
        when(mapper.toCommunityResponse(any(Community.class))).thenReturn(
                CommunityResponse.builder().id(communityId).name("Updated Community").build());

        CommunityResponse response = communityService.updateCommunity(communityId, request, userId);

        assertNotNull(response);
        verify(communityRepository).save(any(Community.class));
    }

    @Test
    void updateCommunity_ShouldThrowException_WhenNotOwner() {
        UUID otherUserId = UUID.randomUUID();
        CommunityRequest request = CommunityRequest.builder().name("Updated").build();

        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));

        assertThrows(ForbiddenException.class,
                () -> communityService.updateCommunity(communityId, request, otherUserId));
    }

    @Test
    void deleteCommunity_ShouldSoftDelete() {
        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));

        communityService.deleteCommunity(communityId, userId);

        assertFalse(community.isActive());
        verify(communityRepository).save(community);
    }

    @Test
    void joinCommunity_ShouldAddMember() {
        UUID newUserId = UUID.randomUUID();

        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(memberRepository.existsByCommunityIdAndUserIdAndActiveTrue(communityId, newUserId))
                .thenReturn(false);
        when(memberRepository.save(any(CommunityMember.class))).thenReturn(member);
        when(communityRepository.save(any(Community.class))).thenReturn(community);

        communityService.joinCommunity(communityId, newUserId);

        verify(memberRepository).save(any(CommunityMember.class));
        assertEquals(2, community.getMemberCount());
    }

    @Test
    void joinCommunity_ShouldThrowException_WhenAlreadyMember() {
        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(memberRepository.existsByCommunityIdAndUserIdAndActiveTrue(communityId, userId))
                .thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> communityService.joinCommunity(communityId, userId));
    }

    @Test
    void leaveCommunity_ShouldRemoveMember() {
        when(communityRepository.findById(communityId)).thenReturn(Optional.of(community));
        when(memberRepository.findByCommunityIdAndUserIdAndActiveTrue(communityId, userId))
                .thenReturn(Optional.of(member));

        communityService.leaveCommunity(communityId, userId);

        assertFalse(member.isActive());
        assertEquals(0, community.getMemberCount());
        verify(memberRepository).save(member);
        verify(communityRepository).save(community);
    }

    @Test
    void isMember_ShouldReturnTrue_WhenMember() {
        when(memberRepository.existsByCommunityIdAndUserIdAndActiveTrue(communityId, userId))
                .thenReturn(true);

        boolean result = communityService.isMember(communityId, userId);

        assertTrue(result);
    }

    @Test
    void getCommunities_ShouldReturnPagedResults() {
        Page<Community> communityPage = new PageImpl<>(List.of(community));

        when(communityRepository.findByActiveTrueOrderByMemberCountDesc(any(PageRequest.class)))
                .thenReturn(communityPage);
        when(mapper.toCommunityResponse(any(Community.class))).thenReturn(
                CommunityResponse.builder().id(communityId).name("Test Community").build());

        Page<CommunityResponse> results = communityService.getCommunities(0, 20, userId);

        assertNotNull(results);
        assertEquals(1, results.getTotalElements());
    }
}

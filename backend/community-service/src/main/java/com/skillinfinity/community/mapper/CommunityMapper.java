package com.skillinfinity.community.mapper;

import com.skillinfinity.community.dto.response.CommentResponse;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PollOptionResponse;
import com.skillinfinity.community.dto.response.PollResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.entity.Comment;
import com.skillinfinity.community.entity.Community;
import com.skillinfinity.community.entity.Poll;
import com.skillinfinity.community.entity.PollOption;
import com.skillinfinity.community.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommunityMapper {

    @Mapping(target = "visibility", expression = "java(community.getVisibility() != null ? community.getVisibility().name() : null)")
    CommunityResponse toCommunityResponse(Community community);

    List<CommunityResponse> toCommunityResponseList(List<Community> communities);

    @Mapping(target = "communityId", source = "post.community.id")
    @Mapping(target = "postType", expression = "java(post.getPostType() != null ? post.getPostType().name() : null)")
    @Mapping(target = "status", expression = "java(post.getStatus() != null ? post.getStatus().name() : null)")
    PostResponse toPostResponse(Post post);

    List<PostResponse> toPostResponseList(List<Post> posts);

    @Mapping(target = "postId", source = "comment.post.id")
    CommentResponse toCommentResponse(Comment comment);

    List<CommentResponse> toCommentResponseList(List<Comment> comments);

    @Mapping(target = "postId", source = "poll.post.id")
    @Mapping(target = "options", source = "options", qualifiedByName = "toPollOptionResponseList")
    PollResponse toPollResponse(Poll poll);

    @Named("toPollOptionResponse")
    PollOptionResponse toPollOptionResponse(PollOption option);

    @Named("toPollOptionResponseList")
    List<PollOptionResponse> toPollOptionResponseList(List<PollOption> options);
}

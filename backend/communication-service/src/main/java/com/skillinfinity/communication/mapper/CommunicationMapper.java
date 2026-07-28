package com.skillinfinity.communication.mapper;

import com.skillinfinity.communication.dto.response.AnnouncementResponse;
import com.skillinfinity.communication.dto.response.AttachmentResponse;
import com.skillinfinity.communication.dto.response.ConversationResponse;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.dto.response.NotificationResponse;
import com.skillinfinity.communication.dto.response.ParticipantResponse;
import com.skillinfinity.communication.dto.response.PresenceResponse;
import com.skillinfinity.communication.dto.response.ReactionResponse;
import com.skillinfinity.communication.entity.Announcement;
import com.skillinfinity.communication.entity.ChatParticipant;
import com.skillinfinity.communication.entity.ChatRoom;
import com.skillinfinity.communication.entity.Message;
import com.skillinfinity.communication.entity.MessageAttachment;
import com.skillinfinity.communication.entity.MessageReaction;
import com.skillinfinity.communication.entity.Notification;
import com.skillinfinity.communication.entity.Presence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommunicationMapper {

    @Mapping(target = "chatRoomId", source = "chatRoom.id")
    @Mapping(target = "messageType", expression = "java(message.getMessageType() != null ? message.getMessageType().name() : null)")
    @Mapping(target = "status", expression = "java(message.getStatus() != null ? message.getStatus().name() : null)")
    @Mapping(target = "attachments", source = "attachments", qualifiedByName = "toAttachmentResponseList")
    @Mapping(target = "reactions", source = "reactions", qualifiedByName = "toReactionResponseList")
    MessageResponse toMessageResponse(Message message);

    @Named("toAttachmentResponse")
    AttachmentResponse toAttachmentResponse(MessageAttachment attachment);

    @Named("toAttachmentResponseList")
    List<AttachmentResponse> toAttachmentResponseList(List<MessageAttachment> attachments);

    @Named("toReactionResponse")
    ReactionResponse toReactionResponse(MessageReaction reaction);

    @Named("toReactionResponseList")
    List<ReactionResponse> toReactionResponseList(List<MessageReaction> reactions);

    @Mapping(target = "conversationType", expression = "java(chatRoom.getConversationType() != null ? chatRoom.getConversationType().name() : null)")
    @Mapping(target = "participants", source = "participants", qualifiedByName = "toParticipantResponseList")
    ConversationResponse toConversationResponse(ChatRoom chatRoom);

    @Mapping(target = "unreadCount", ignore = true)
    ConversationResponse toConversationResponseWithUnread(ChatRoom chatRoom);

    @Named("toParticipantResponse")
    ParticipantResponse toParticipantResponse(ChatParticipant participant);

    @Named("toParticipantResponseList")
    List<ParticipantResponse> toParticipantResponseList(List<ChatParticipant> participants);

    @Mapping(target = "category", expression = "java(notification.getCategory() != null ? notification.getCategory().name() : null)")
    @Mapping(target = "channel", expression = "java(notification.getChannel() != null ? notification.getChannel().name() : null)")
    NotificationResponse toNotificationResponse(Notification notification);

    List<NotificationResponse> toNotificationResponseList(List<Notification> notifications);

    @Mapping(target = "status", expression = "java(announcement.getStatus() != null ? announcement.getStatus().name() : null)")
    @Mapping(target = "targetAudience", expression = "java(announcement.getTargetAudience() != null ? announcement.getTargetAudience().name() : null)")
    AnnouncementResponse toAnnouncementResponse(Announcement announcement);

    List<AnnouncementResponse> toAnnouncementResponseList(List<Announcement> announcements);

    @Mapping(target = "status", expression = "java(presence.getStatus() != null ? presence.getStatus().name() : null)")
    PresenceResponse toPresenceResponse(Presence presence);
}

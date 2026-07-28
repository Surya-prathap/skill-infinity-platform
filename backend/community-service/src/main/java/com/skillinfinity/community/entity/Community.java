package com.skillinfinity.community.entity;

import com.skillinfinity.community.enumeration.CommunityVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "communities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Community {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(unique = true, length = 50)
    private String slug;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    private CommunityVisibility visibility;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "member_count")
    private int memberCount;

    @Column(name = "post_count")
    private int postCount;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "is_verified")
    private boolean verified;

    @Column(name = "rules", columnDefinition = "TEXT")
    private String rules;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @OneToMany(mappedBy = "community")
    private List<CommunityMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "community")
    private List<Post> posts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.active = true;
        this.memberCount = 0;
        this.postCount = 0;
        this.verified = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

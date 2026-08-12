package com.skillinfinity.session.review.repository;

import com.skillinfinity.session.review.entity.MentorRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorRatingRepository extends JpaRepository<MentorRating, UUID> {

    Optional<MentorRating> findByMentorId(UUID mentorId);
}

package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Mentor;
import com.skillinfinity.mentor.enumeration.MentorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, UUID> {

    Optional<Mentor> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    List<Mentor> findByStatus(MentorStatus status);

    /*
     * The search/list paths below feed the landing page, mentor directory and
     * dashboards. `Mentor.profile` and `Mentor.statistics` are LAZY one-to-ones;
     * mapping every row to a summary used to issue one extra SELECT per mentor
     * (N+1 — e.g. 101 queries for the landing page's 100-row fetch). Fetching
     * them in the same query as the mentor rows collapses that to a handful of
     * round-trips.
     */
    @EntityGraph(attributePaths = { "profile", "statistics" })
    Page<Mentor> findByStatus(MentorStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "profile", "statistics" })
    @Query("SELECT m FROM Mentor m WHERE m.verified = true AND m.status = 'ACTIVE' " +
           "AND (:keyword IS NULL OR LOWER(m.profile.headline) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(m.profile.bio) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Mentor> searchMentors(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = { "profile", "statistics" })
    @Query("SELECT m FROM Mentor m JOIN m.expertiseList e WHERE e.skill.id IN :skillIds " +
           "AND m.verified = true AND m.status = 'ACTIVE'")
    Page<Mentor> findBySkillIds(@Param("skillIds") Collection<UUID> skillIds, Pageable pageable);

    @EntityGraph(attributePaths = { "profile", "statistics" })
    @Query("SELECT m FROM Mentor m JOIN m.languages l WHERE l.name IN :languages " +
           "AND m.verified = true AND m.status = 'ACTIVE'")
    Page<Mentor> findByLanguages(@Param("languages") Collection<String> languages, Pageable pageable);

    @EntityGraph(attributePaths = { "profile", "statistics" })
    @Query("SELECT m FROM Mentor m WHERE m.verified = true AND m.status = 'ACTIVE' " +
           "AND (:country IS NULL OR m.profile.country = :country)")
    Page<Mentor> findByCountry(@Param("country") String country, Pageable pageable);

    long countByStatus(MentorStatus status);
}

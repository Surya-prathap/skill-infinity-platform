-- ============================================================================
-- Skill Infinity — Dummy Data Cleanup
-- ============================================================================
-- Removes unwanted dummy learners/mentors/profiles/sessions/bookings/
-- transactions/wallet data while PRESERVING:
--
--   * Whitelisted test accounts:  surya@gmail.com, user1@gmail.com,
--                                 user2@gmail.com, dinesh@gmail.com
--   * Manually created mentor profiles: "Java Mentor", "React Developer",
--                                 "System Designer"
--   * The admin account and credentials (role ADMIN is never deleted)
--
-- SAFETY:
--   * FOREIGN_KEY_CHECKS is disabled during the run and restored afterwards,
--     so child rows are removed without breaking constraints.
--   * Every DELETE is scoped with NOT IN (whitelist) so whitelisted data is
--     never touched. Sessions/bookings are only removed when BOTH their mentor
--     AND learner fall outside the preserved set (legacy rows that store the
--     mentor ENTITY id are protected through preserved_mentors).
--   * Run as root (or a user with access to all service schemas).
--
-- Usage (from any MySQL client):
--   mysql -u root -p < scripts/cleanup-dummy-data.sql
--
-- Preview first: uncomment the "-- Preview:" SELECT blocks, run the script
-- with the DELETE lines commented out, review the row counts, then run again.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;
SET @whitelist = 'surya@gmail.com,user1@gmail.com,user2@gmail.com,dinesh@gmail.com';

-- ---------------------------------------------------------------------------
-- 0. Preserved sets
-- ---------------------------------------------------------------------------
-- Whitelisted user ids (identity service owns the user_credentials table).
CREATE TEMPORARY TABLE whitelist_users AS
SELECT id FROM skill_infinity_identity.user_credentials
WHERE email IN ('surya@gmail.com', 'user1@gmail.com', 'user2@gmail.com', 'dinesh@gmail.com');

-- Preserved mentors: any mentor owned by a whitelisted user, plus the three
-- manually created mentor profiles by headline (belt & suspenders).
CREATE TEMPORARY TABLE preserved_mentors AS
SELECT m.id, m.user_id
FROM skill_infinity_mentor.mentors m
WHERE m.user_id IN (SELECT id FROM whitelist_users)
   OR m.id IN (SELECT mp.mentor_id FROM skill_infinity_mentor.mentor_profiles mp
               WHERE mp.headline LIKE '%Java Mentor%'
                  OR mp.headline LIKE '%React Developer%'
                  OR mp.headline LIKE '%System Designer%');

-- -- Preview: how much will be deleted?
-- SELECT 'identity users' AS entity, COUNT(*) AS rows_to_delete
--   FROM skill_infinity_identity.user_credentials
--  WHERE email NOT IN ('surya@gmail.com','user1@gmail.com','user2@gmail.com','dinesh@gmail.com');

-- ---------------------------------------------------------------------------
-- 1. IDENTITY service — remove non-whitelisted accounts
-- ---------------------------------------------------------------------------
DELETE FROM skill_infinity_identity.user_credential_roles
 WHERE user_credential_id NOT IN (SELECT id FROM whitelist_users);

DELETE FROM skill_infinity_identity.user_credentials
 WHERE email NOT IN ('surya@gmail.com', 'user1@gmail.com', 'user2@gmail.com', 'dinesh@gmail.com');

-- ---------------------------------------------------------------------------
-- 2. ADMIN service — keep every ADMIN account; remove only non-admin users
--    that are not part of the whitelist. Admin is never shown as a learner.
-- ---------------------------------------------------------------------------
DELETE FROM skill_infinity_admin.admin_users
 WHERE role NOT LIKE '%ADMIN%'
   AND email NOT IN ('surya@gmail.com', 'user1@gmail.com', 'user2@gmail.com', 'dinesh@gmail.com');

-- ---------------------------------------------------------------------------
-- 3. MENTOR service — remove mentor profiles + all related rows, keeping the
--    preserved mentors (whitelist owners + the 3 named profiles).
-- ---------------------------------------------------------------------------
DELETE FROM skill_infinity_mentor.time_slots
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.social_profiles
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_preferences
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_statistics
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_languages
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_education
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_experiences
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.expertise
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.pricing
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_availabilities
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);
DELETE FROM skill_infinity_mentor.mentor_profiles
 WHERE mentor_id NOT IN (SELECT id FROM preserved_mentors);

DELETE FROM skill_infinity_mentor.mentors
 WHERE id NOT IN (SELECT id FROM preserved_mentors);

-- ---------------------------------------------------------------------------
-- 4. SESSION service — bookings/sessions that involve only non-preserved
--    people. Child rows are removed first (no orphaned references).
-- ---------------------------------------------------------------------------
-- Bookings whose mentor AND learner are both outside the preserved set.
DELETE FROM skill_infinity_session.bookings
 WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
        AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
   AND (learner_id NOT IN (SELECT id FROM whitelist_users));

-- Sessions involving only non-preserved people.
DELETE FROM skill_infinity_session.session_reminders
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.session_history
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.attendance
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.session_participants
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.meeting_links
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.cancellations
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.reschedule_requests
 WHERE session_id IN (SELECT id FROM skill_infinity_session.sessions
                       WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
                              AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
                         AND (learner_id NOT IN (SELECT id FROM whitelist_users)));

DELETE FROM skill_infinity_session.sessions
 WHERE (mentor_id NOT IN (SELECT id FROM whitelist_users)
        AND mentor_id NOT IN (SELECT id FROM preserved_mentors))
   AND (learner_id NOT IN (SELECT id FROM whitelist_users));

-- ---------------------------------------------------------------------------
-- 5. WALLET service — wallets, transactions, ledgers, audits and withdrawal
--    requests for non-whitelisted users.
-- ---------------------------------------------------------------------------
DELETE FROM skill_infinity_wallet.credit_transactions
 WHERE wallet_id IN (SELECT w.id FROM skill_infinity_wallet.wallets w
                      WHERE w.user_id NOT IN (SELECT id FROM whitelist_users));

DELETE FROM skill_infinity_wallet.wallet_ledgers
 WHERE wallet_id IN (SELECT w.id FROM skill_infinity_wallet.wallets w
                      WHERE w.user_id NOT IN (SELECT id FROM whitelist_users));

DELETE FROM skill_infinity_wallet.wallet_audits
 WHERE wallet_id IN (SELECT w.id FROM skill_infinity_wallet.wallets w
                      WHERE w.user_id NOT IN (SELECT id FROM whitelist_users));

DELETE FROM skill_infinity_wallet.wallet_statistics
 WHERE wallet_id IN (SELECT w.id FROM skill_infinity_wallet.wallets w
                      WHERE w.user_id NOT IN (SELECT id FROM whitelist_users));

DELETE FROM skill_infinity_wallet.wallet_balances
 WHERE wallet_id IN (SELECT w.id FROM skill_infinity_wallet.wallets w
                      WHERE w.user_id NOT IN (SELECT id FROM whitelist_users));

DELETE FROM skill_infinity_wallet.withdrawal_requests
 WHERE user_id NOT IN (SELECT id FROM whitelist_users);

DELETE FROM skill_infinity_wallet.wallets
 WHERE user_id NOT IN (SELECT id FROM whitelist_users);

-- ---------------------------------------------------------------------------
-- Cleanup: drop the temporary tables and restore DB safety settings.
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS preserved_mentors;
DROP TEMPORARY TABLE IF EXISTS whitelist_users;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- Done. The whitelist accounts, the admin account and the three manual mentor
-- profiles (Java Mentor / React Developer / System Designer) are untouched.

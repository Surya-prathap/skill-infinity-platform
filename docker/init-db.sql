-- Skill Infinity Platform - Database Initialization
-- Each microservice has its own isolated database

CREATE DATABASE IF NOT EXISTS skill_infinity_identity
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_user
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_mentor
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_session
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_wallet
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_payment
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_community
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_communication
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_review
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS skill_infinity_admin
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create application user (optional, can also use root for dev)
CREATE USER IF NOT EXISTS 'skillinfinity'@'%' IDENTIFIED BY 'skillinfinity123';
GRANT ALL PRIVILEGES ON skill_infinity_identity.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_user.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_mentor.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_session.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_wallet.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_payment.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_community.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_communication.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_review.* TO 'skillinfinity'@'%';
GRANT ALL PRIVILEGES ON skill_infinity_admin.* TO 'skillinfinity'@'%';

-- Also ensure root has remote access (for development)
-- Note: MySQL entrypoint does NOT expand ${...} inside .sql files, so the literal
-- password must match the container's MYSQL_ROOT_PASSWORD (see docker/.env).
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

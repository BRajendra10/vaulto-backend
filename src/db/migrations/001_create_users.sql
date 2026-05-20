CREATE TABLE IF NOT EXISTS users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  username          VARCHAR(50) NOT NULL UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password          TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  avatar            TEXT,
  avatar_public_id  TEXT,
  auth_provider     ENUM('local', 'google', 'github') DEFAULT 'local',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
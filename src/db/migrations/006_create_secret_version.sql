CREATE TABLE IF NOT EXISTS secret_version (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  secret_id   INT NOT NULL,
  version     INT NOT NULL,
  value       TEXT NOT NULL,           -- stored encrypted, see secrets.crypto.js
  environment ENUM('development', 'staging', 'production') NOT NULL,
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_version_per_secret (secret_id, version),
  FOREIGN KEY (secret_id)  REFERENCES secret(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)  ON DELETE RESTRICT
);

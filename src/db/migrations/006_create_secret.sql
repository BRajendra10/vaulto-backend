CREATE TABLE IF NOT EXISTS secret (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  project_id      INT NOT NULL,
  `key`           VARCHAR(255) NOT NULL,
  current_version INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,
  created_by      INT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_key_per_project (project_id, `key`),
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE RESTRICT
);

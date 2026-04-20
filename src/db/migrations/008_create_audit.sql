CREATE TABLE IF NOT EXISTS audit (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  maintainer_id     INT,               -- NULL for account-level actions
  project_id        INT,               -- NULL for account-level actions
  secret_id         INT,
  secret_version_id INT,
  action            VARCHAR(100) NOT NULL,  -- e.g. 'secret.created', 'secret.rotated'
  old_value         TEXT,              -- stored encrypted if sensitive
  new_value         TEXT,              -- stored encrypted if sensitive
  ip_address        VARCHAR(45),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)           REFERENCES users(id)          ON DELETE RESTRICT,
  FOREIGN KEY (maintainer_id)     REFERENCES maintainer(id)     ON DELETE SET NULL,
  FOREIGN KEY (project_id)        REFERENCES project(id)        ON DELETE SET NULL,
  FOREIGN KEY (secret_id)         REFERENCES secret(id)         ON DELETE SET NULL,
  FOREIGN KEY (secret_version_id) REFERENCES secret_version(id) ON DELETE SET NULL
);

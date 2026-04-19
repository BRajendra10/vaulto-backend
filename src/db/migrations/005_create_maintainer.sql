CREATE TABLE IF NOT EXISTS maintainer (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  project_id INT NOT NULL,
  role       ENUM('viewer', 'developer', 'admin', 'owner') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_project (user_id, project_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

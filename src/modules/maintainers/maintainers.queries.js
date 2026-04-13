const findAllByProject = `
  SELECT m.id, m.role, m.created_at, m.updated_at,
         u.id AS user_id, u.email, u.avatar
  FROM maintainer m
  JOIN users u ON u.id = m.user_id
  WHERE m.project_id = ?
  ORDER BY m.created_at ASC
  LIMIT ? OFFSET ?
`

const countByProject = `
  SELECT COUNT(*) AS total FROM maintainer WHERE project_id = ?
`

const findByUserAndProject = `
  SELECT id, role FROM maintainer
  WHERE user_id = ? AND project_id = ? LIMIT 1
`

const findUserByEmail = `
  SELECT id, email FROM users WHERE email = ? LIMIT 1
`

const addMaintainer = `
  INSERT INTO maintainer (user_id, project_id, role, created_at, updated_at)
  VALUES (?, ?, ?, NOW(), NOW())
`

const updateRole = `
  UPDATE maintainer SET role = ?, updated_at = NOW()
  WHERE user_id = ? AND project_id = ?
`

const removeMaintainer = `
  DELETE FROM maintainer WHERE user_id = ? AND project_id = ?
`

export {
  findAllByProject,
  countByProject,
  findByUserAndProject,
  findUserByEmail,
  addMaintainer,
  updateRole,
  removeMaintainer,
}

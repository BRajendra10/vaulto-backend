const findAllByUser = `
  SELECT p.id, p.project_name, p.owner_id, p.is_active, p.created_at, p.updated_at, m.role
  FROM project p
  JOIN maintainer m ON m.project_id = p.id
  WHERE m.user_id = ? AND p.deleted_at IS NULL
  ORDER BY p.created_at DESC
  LIMIT ? OFFSET ?
`

const countByUser = `
  SELECT COUNT(*) AS total
  FROM project p
  JOIN maintainer m ON m.project_id = p.id
  WHERE m.user_id = ? AND p.deleted_at IS NULL
`

const findById = `
  SELECT p.id, p.project_name, p.owner_id, p.is_active, p.created_at, p.updated_at
  FROM project p
  WHERE p.id = ? AND p.deleted_at IS NULL
  LIMIT 1
`

const createProject = `
  INSERT INTO project (project_name, owner_id, is_active, created_at, updated_at)
  VALUES (?, ?, true, NOW(), NOW())
`

const addOwnerAsMaintainer = `
  INSERT INTO maintainer (user_id, project_id, role, created_at, updated_at)
  VALUES (?, ?, 'owner', NOW(), NOW())
`

const updateProject = `
  UPDATE project SET project_name = ?, updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
`

const softDeleteProject = `
  UPDATE project SET deleted_at = NOW(), is_active = false, updated_at = NOW()
  WHERE id = ?
`

export {
  findAllByUser,
  countByUser,
  findById,
  createProject,
  addOwnerAsMaintainer,
  updateProject,
  softDeleteProject,
}

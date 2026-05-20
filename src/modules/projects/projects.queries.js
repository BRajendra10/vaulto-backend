const findAllByUser = `
  SELECT 
    p.id,
    p.project_name,
    p.description,
    p.owner_id,
    p.is_active,
    p.created_at,
    p.updated_at,
    m.role,

    COUNT(DISTINCT s.id) AS secrets_count,
    COUNT(DISTINCT pm.user_id) AS maintainers_count

  FROM project p

  JOIN maintainer m 
    ON m.project_id = p.id

  LEFT JOIN secret s 
    ON s.project_id = p.id
    AND s.deleted_at IS NULL

  LEFT JOIN maintainer pm 
    ON pm.project_id = p.id

  WHERE m.user_id = ?
    AND p.deleted_at IS NULL

  GROUP BY
    p.id,
    p.project_name,
    p.description,
    p.owner_id,
    p.is_active,
    p.created_at,
    p.updated_at,
    m.role

  ORDER BY p.created_at DESC
`

const countByUser = `
  SELECT COUNT(*) AS total
  FROM project p
  JOIN maintainer m ON m.project_id = p.id
  WHERE m.user_id = ? AND p.deleted_at IS NULL
`

const findById = `
  SELECT p.id, p.project_name, p.description, p.owner_id, p.api_key, p.is_active, p.created_at, p.updated_at
  FROM project p
  WHERE p.id = ? AND p.deleted_at IS NULL
  LIMIT 1
`

const createProject = `
  INSERT INTO project (project_name, description, owner_id, is_active, created_at, updated_at)
  VALUES (?, ?, ?, true, NOW(), NOW())
`

const addOwnerAsMaintainer = `
  INSERT INTO maintainer (user_id, project_id, role, created_at, updated_at)
  VALUES (?, ?, 'owner', NOW(), NOW())
`

const updateProject = `
  UPDATE project SET project_name = ?, description = ?, updated_at = NOW()
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

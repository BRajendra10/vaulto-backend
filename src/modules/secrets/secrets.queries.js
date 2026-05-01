const findAllByProject = `
  SELECT s.id, s.key, s.current_version, s.is_active, s.expires_at, s.created_at, s.updated_at,
         u.email AS created_by_email
  FROM secret s
  JOIN users u ON u.id = s.created_by
  WHERE s.project_id = ? AND s.deleted_at IS NULL
  ORDER BY s.created_at DESC
`
// LIMIT ? OFFSET ?

const countByProject = `
  SELECT COUNT(*) AS total FROM secret
  WHERE project_id = ? AND deleted_at IS NULL
`

const findById = `
  SELECT s.*, u.email AS created_by_email
  FROM secret s
  JOIN users u ON u.id = s.created_by
  WHERE s.id = ? AND s.project_id = ? AND s.deleted_at IS NULL
  LIMIT 1
`

const findByKey = `
  SELECT id FROM secret
  WHERE \`key\` = ? AND project_id = ? AND deleted_at IS NULL
  LIMIT 1
`

const createSecret = `
  INSERT INTO secret (project_id, \`key\`, current_version, is_active, expires_at, created_by, created_at, updated_at)
  VALUES (?, ?, 1, true, ?, ?, NOW(), NOW())
`

const createSecretVersion = `
  INSERT INTO secret_version (secret_id, version, value, environment, created_by, created_at)
  VALUES (?, ?, ?, ?, ?, NOW())
`

const getCurrentVersion = `
  SELECT sv.*
  FROM secret_version sv
  JOIN secret s ON s.id = sv.secret_id
  WHERE sv.secret_id = ? AND sv.version = s.current_version
  LIMIT 1
`

const getAllVersions = `
  SELECT sv.id, sv.version, sv.environment, sv.created_at, u.email AS created_by_email
  FROM secret_version sv
  JOIN users u ON u.id = sv.created_by
  WHERE sv.secret_id = ?
  ORDER BY sv.version DESC
`
// LIMIT ? OFFSET ?

const countVersions = `
  SELECT COUNT(*) AS total FROM secret_version WHERE secret_id = ?
`

const incrementVersion = `
  UPDATE secret SET current_version = current_version + 1, updated_at = NOW()
  WHERE id = ?
`

const updateSecret = `
  UPDATE secret SET expires_at = ?, updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
`

const softDeleteSecret = `
  UPDATE secret SET deleted_at = NOW(), is_active = false, updated_at = NOW()
  WHERE id = ? AND project_id = ?
`

export {
  findAllByProject, countByProject, findById, findByKey,
  createSecret, createSecretVersion, getCurrentVersion,
  getAllVersions, countVersions, incrementVersion,
  updateSecret, softDeleteSecret,
}

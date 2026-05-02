const logAction = `
  INSERT INTO audit (user_id, maintainer_id, project_id, secret_id, secret_version_id, action, old_value, new_value, ip_address, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`

const findMaintainerId = `
  SELECT id FROM maintainer
  WHERE user_id = ? AND project_id = ?
  LIMIT 1
`

const findByProject = `
  SELECT a.id, a.action, a.old_value, a.new_value, a.ip_address, a.created_at,
         u.email AS performed_by,
         m.role  AS performer_role,
         s.key   AS secret_key
  FROM audit a
  JOIN users u ON u.id = a.user_id
  LEFT JOIN maintainer m ON m.id = a.maintainer_id
  LEFT JOIN secret s ON s.id = a.secret_id
  WHERE a.project_id = ?
  ORDER BY a.created_at DESC
`
// LIMIT ? OFFSET ?

const countByProject = `
  SELECT COUNT(*) AS total FROM audit WHERE project_id = ?
`

export { logAction, findMaintainerId, findByProject, countByProject }

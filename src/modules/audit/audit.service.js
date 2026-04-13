import { pool } from '../../db/pool.js'
import * as q from './audit.queries.js'
import { getPagination, paginatedResponse } from '../../utils/pagination.js'

// Called after every write operation across the app
// projectId and secretId are optional — account-level actions won't have them
const logAction = async ({
  userId,
  projectId    = null,
  secretId     = null,
  secretVersionId = null,
  action,
  oldValue     = null,
  newValue     = null,
  ipAddress    = null,
}) => {
  // Look up maintainer_id if this is a project-scoped action
  let maintainerId = null
  if (projectId) {
    const [rows] = await pool.execute(q.findMaintainerId, [userId, projectId])
    if (rows.length > 0) maintainerId = rows[0].id
  }

  await pool.execute(q.logAction, [
    userId, maintainerId, projectId, secretId,
    secretVersionId, action, oldValue, newValue, ipAddress,
  ])
}

const getAuditLog = async (projectId, query) => {
  const { page, limit, offset } = getPagination(query)
  const [rows] = await pool.execute(q.findByProject, [projectId, limit, offset])
  const [[{ total }]] = await pool.execute(q.countByProject, [projectId])
  return paginatedResponse(rows, total, page, limit)
}

export { logAction, getAuditLog }

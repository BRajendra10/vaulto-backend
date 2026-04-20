import { pool } from '../db/pool.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

// Defines exactly what each role can do
const PERMISSIONS = {
  viewer:    ['secret:read'],
  developer: ['secret:read', 'secret:create', 'secret:update'],
  admin:     ['secret:read', 'secret:create', 'secret:update', 'secret:rotate', 'secret:delete', 'member:manage'],
  owner:     ['secret:read', 'secret:create', 'secret:update', 'secret:rotate', 'secret:delete', 'member:manage', 'project:delete'],
}

const authorize = (requiredPermission) =>
  catchAsync(async (req, res, next) => {
    const { projectId } = req.params
    const userId = req.user.id

    const [rows] = await pool.execute(
      `SELECT role FROM maintainer WHERE user_id = ? AND project_id = ? LIMIT 1`,
      [userId, projectId]
    )

    if (rows.length === 0) {
      throw new AppError('You do not have access to this project', 403)
    }

    const userPermissions = PERMISSIONS[rows[0].role]

    if (!userPermissions.includes(requiredPermission)) {
      throw new AppError(`You need '${requiredPermission}' permission for this action`, 403)
    }

    req.maintainerRole = rows[0].role
    next()
  })

export default authorize

import { pool } from '../../db/pool.js'
import * as q from './maintainers.queries.js'
import { logAction } from '../audit/audit.service.js'
import AppError from '../../utils/AppError.js'

// ── Role Hierarchy Configuration ──────────────────────────────────
const ROLES = {
  viewer: 1,
  developer: 2,
  admin: 3,
  owner: 4,
}

/**
 * Determines the actor's role in a project. 
 * Owners are identified via the project table, others via maintainer table.
 */
const getEffectiveRole = async (userId, projectId) => {
  const [[project]] = await pool.execute(q.findProjectOwner, [projectId])
  if (!project) throw new AppError('Project not found', 404)
  if (project.owner_id === userId) return 'owner'

  const [maintainer] = await pool.execute(q.findByUserAndProject, [userId, projectId])
  return maintainer.length > 0 ? maintainer[0].role : null
}

const validateHierarchy = (actorRole, targetRole, action = 'modify') => {
  const actorLevel = ROLES[actorRole] || 0
  const targetLevel = ROLES[targetRole] || 0

  if (actorLevel === 0) throw new AppError('Access denied', 403)
  
  // Hierarchy Rule: Actor must have a HIGHER level than the target they are modifying/assigning
  if (actorLevel <= targetLevel) {
    throw new AppError(`Insufficient permissions to ${action} a user with ${targetRole} level`, 403)
  }
}

const getAllMaintainers = async (projectId, query) => {
  const limit = Math.min(parseInt(query.limit) || 20, 100)
  const lastId = parseInt(query.cursor) || 0

  // const [rows] = await pool.execute(q.findAllByProject, [projectId, lastId, limit])
  const [rows] = await pool.execute(`${q.findAllByProject} LIMIT ${limit}`, [projectId, lastId])
  const [[{ total }]] = await pool.execute(q.countByProject, [projectId])

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null

  return {
    data: rows,
    meta: { total, limit, nextCursor }
  }
}

const addMaintainer = async (actorId, projectId, { email, role }, ipAddress) => {
  const actorRole = await getEffectiveRole(actorId, projectId)
  
  // 1. Role checks
  validateHierarchy(actorRole, role, 'assign')

  const [users] = await pool.execute(q.findUserByEmail, [email])
  if (users.length === 0) throw new AppError('No user found with this email', 404)
  const targetUserId = users[0].id

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute(q.addMaintainer, [targetUserId, projectId, role])

    await logAction({
      userId: actorId, projectId,
      action: 'maintainer.added',
      newValue: JSON.stringify({ targetUserId, email, role }),
      ipAddress,
    }, connection) // Pass connection if logAction supports it, otherwise log after commit

    await connection.commit()
    const [rows] = await connection.execute(q.findByUserAndProject, [targetUserId, projectId])
    return rows[0]
  } catch (err) {
    await connection.rollback()
    if (err.code === 'ER_DUP_ENTRY') throw new AppError('User is already a member of this project', 409)
    throw err
  } finally {
    connection.release()
  }
}

const updateRole = async (actorId, projectId, targetUserId, { role: newRole }, ipAddress) => {
  if (parseInt(actorId) === parseInt(targetUserId)) {
    throw new AppError('You cannot change your own role to prevent self-lockout or escalation', 400)
  }

  const actorRole = await getEffectiveRole(actorId, projectId)
  const targetCurrentRole = await getEffectiveRole(targetUserId, projectId)

  if (!targetCurrentRole) throw new AppError('User is not a member of this project', 404)

  // 2. Hierarchy Enforcement
  // Can I modify the current user? (Must be higher than them)
  validateHierarchy(actorRole, targetCurrentRole, 'modify')
  // Can I assign the new role? (Must be higher than the role I'm giving)
  validateHierarchy(actorRole, newRole, 'assign')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute(q.updateRole, [newRole, targetUserId, projectId])

    await logAction({
      userId: actorId, projectId,
      action: 'maintainer.role_changed',
      oldValue: JSON.stringify({ role: targetCurrentRole }),
      newValue: JSON.stringify({ role: newRole }),
      ipAddress,
    }, connection)

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

const removeMaintainer = async (actorId, projectId, targetUserId, ipAddress) => {
  const actorRole = await getEffectiveRole(actorId, projectId)
  const targetCurrentRole = await getEffectiveRole(targetUserId, projectId)

  if (!targetCurrentRole) throw new AppError('User is not a member of this project', 404)

  // Self-removal check: Usually allowed for non-owners to leave a project
  if (parseInt(actorId) !== parseInt(targetUserId)) {
    validateHierarchy(actorRole, targetCurrentRole, 'remove')
  } else if (targetCurrentRole === 'owner') {
    throw new AppError('Owners cannot leave the project. Transfer ownership first.', 400)
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute(q.removeMaintainer, [targetUserId, projectId])

    await logAction({
      userId: actorId, projectId,
      action: 'maintainer.removed',
      oldValue: JSON.stringify({ targetUserId, role: targetCurrentRole }),
      ipAddress,
    }, connection)

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export { getAllMaintainers, addMaintainer, updateRole, removeMaintainer }

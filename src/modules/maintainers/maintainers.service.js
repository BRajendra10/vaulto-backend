import { pool } from '../../db/pool.js'
import * as q from './maintainers.queries.js'
import { logAction } from '../audit/audit.service.js'
import AppError from '../../utils/AppError.js'
import { getPagination, paginatedResponse } from '../../utils/pagination.js'

const getAllMaintainers = async (projectId, query) => {
  const { page, limit, offset } = getPagination(query)
  const [rows] = await pool.execute(q.findAllByProject, [projectId, limit, offset])
  const [[{ total }]] = await pool.execute(q.countByProject, [projectId])
  return paginatedResponse(rows, total, page, limit)
}

const addMaintainer = async (actorId, projectId, { email, role }, ipAddress) => {
  // Find user by email
  const [users] = await pool.execute(q.findUserByEmail, [email])
  if (users.length === 0) throw new AppError('No user found with this email', 404)

  const targetUserId = users[0].id

  // Check if already a member
  const [existing] = await pool.execute(q.findByUserAndProject, [targetUserId, projectId])
  if (existing.length > 0) throw new AppError('User is already a member of this project', 409)

  // Cannot add someone as owner — owner is set only on project creation
  if (role === 'owner') throw new AppError('Cannot assign owner role manually', 400)

  await pool.execute(q.addMaintainer, [targetUserId, projectId, role])

  await logAction({
    userId: actorId, projectId,
    action: 'maintainer.added',
    newValue: JSON.stringify({ email, role }),
    ipAddress,
  })

  const [rows] = await pool.execute(q.findByUserAndProject, [targetUserId, projectId])
  return rows[0]
}

const updateRole = async (actorId, projectId, targetUserId, { role }, ipAddress) => {
  // Cannot change the owner's role
  const [existing] = await pool.execute(q.findByUserAndProject, [targetUserId, projectId])
  if (existing.length === 0) throw new AppError('User is not a member of this project', 404)
  if (existing[0].role === 'owner') throw new AppError('Cannot change the owner\'s role', 400)
  if (role === 'owner') throw new AppError('Cannot assign owner role manually', 400)

  await pool.execute(q.updateRole, [role, targetUserId, projectId])

  await logAction({
    userId: actorId, projectId,
    action: 'maintainer.role_changed',
    oldValue: JSON.stringify({ role: existing[0].role }),
    newValue: JSON.stringify({ role }),
    ipAddress,
  })
}

const removeMaintainer = async (actorId, projectId, targetUserId, ipAddress) => {
  const [existing] = await pool.execute(q.findByUserAndProject, [targetUserId, projectId])
  if (existing.length === 0) throw new AppError('User is not a member of this project', 404)
  if (existing[0].role === 'owner') throw new AppError('Cannot remove the project owner', 400)

  await pool.execute(q.removeMaintainer, [targetUserId, projectId])

  await logAction({
    userId: actorId, projectId,
    action: 'maintainer.removed',
    ipAddress,
  })
}

export { getAllMaintainers, addMaintainer, updateRole, removeMaintainer }

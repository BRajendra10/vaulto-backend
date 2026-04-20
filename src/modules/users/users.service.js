import bcrypt from 'bcryptjs'
import { pool } from '../../db/pool.js'
import * as q from './users.queries.js'
import AppError from '../../utils/AppError.js'

const getMe = async (userId) => {
  const [rows] = await pool.execute(q.findById, [userId])
  if (rows.length === 0) throw new AppError('User not found', 404)
  return rows[0]
}

const updateProfile = async (userId, { avatar }) => {
  await pool.execute(q.updateProfile, [avatar, userId])
  const [rows] = await pool.execute(q.findById, [userId])
  return rows[0]
}

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  // Verify current password first
  const [rows] = await pool.execute(q.findPasswordById, [userId])
  if (rows.length === 0) throw new AppError('User not found', 404)

  const isValid = await bcrypt.compare(currentPassword, rows[0].password)
  if (!isValid) throw new AppError('Current password is incorrect', 401)

  const hashed = await bcrypt.hash(newPassword, 12)
  await pool.execute(q.updatePassword, [hashed, userId])
}

export { getMe, updateProfile, updatePassword }

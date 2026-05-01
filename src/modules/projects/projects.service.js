import crypto from 'crypto'
import { pool } from '../../db/pool.js'
import * as q from './projects.queries.js'
import { logAction } from '../audit/audit.service.js'
import AppError from '../../utils/AppError.js'
import { getPagination, paginatedResponse } from '../../utils/pagination.js'

const getAllProjects = async (userId, query) => {
  const { page, limit, offset } = getPagination(query)
  // const [rows] = await pool.execute(q.findAllByUser, [userId, limit, offset])
  const [rows] = await pool.execute(`${q.findAllByUser} LIMIT ${limit} OFFSET ${offset}`, [userId])
  const [[{ total }]] = await pool.execute(q.countByUser, [userId])
  return paginatedResponse(rows, total, page, limit)
}

const getProjectById = async (projectId) => {
  const [rows] = await pool.execute(q.findById, [projectId])
  if (rows.length === 0) throw new AppError('Project not found', 404)
  return rows[0]
}

const createProject = async (userId, { project_name }, ipAddress) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(q.createProject, [project_name, userId])
    const projectId = result.insertId

    // Generate a secure 64-character API key (32 bytes)
    const apiKey = crypto.randomBytes(32).toString('hex')
    await connection.execute('UPDATE project SET api_key = ? WHERE id = ?', [apiKey, projectId])

    // Automatically add creator as owner in maintainer table
    await connection.execute(q.addOwnerAsMaintainer, [userId, projectId])

    await connection.commit()

    await logAction({
      userId, projectId, action: 'project.created', ipAddress,
    })

    return getProjectById(projectId)
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

const updateProject = async (userId, projectId, { project_name }, ipAddress) => {
  const [result] = await pool.execute(q.updateProject, [project_name, projectId])
  if (result.affectedRows === 0) throw new AppError('Project not found', 404)

  await logAction({ userId, projectId, action: 'project.updated', ipAddress })

  return getProjectById(projectId)
}

const deleteProject = async (userId, projectId, ipAddress) => {
  const [result] = await pool.execute(q.softDeleteProject, [projectId])
  if (result.affectedRows === 0) throw new AppError('Project not found', 404)

  await logAction({ userId, projectId, action: 'project.deleted', ipAddress })
}

export { getAllProjects, getProjectById, createProject, updateProject, deleteProject }

import { pool } from '../../db/pool.js'
import * as q from './secrets.queries.js'
import { encrypt, decrypt } from './secrets.crypto.js'
import { logAction } from '../audit/audit.service.js'
import AppError from '../../utils/AppError.js'
import { getPagination, paginatedResponse } from '../../utils/pagination.js'

const getAllSecrets = async (projectId, query) => {
  const { page, limit, offset } = getPagination(query)
  // const [rows] = await pool.execute(q.findAllByProject, [projectId, limit, offset])
  const [rows] = await pool.execute(`${q.findAllByProject} LIMIT ${limit} OFFSET ${offset}`, [projectId])
  const [[{ total }]] = await pool.execute(q.countByProject, [projectId])
  // Never return values in list — only metadata
  return paginatedResponse(rows, total, page, limit)
}

// const [rows] = await pool.execute(`${q.findAllByUser} LIMIT ${limit} OFFSET ${offset}`, [userId])

const getSecretById = async (projectId, secretId) => {
  const [rows] = await pool.execute(q.findById, [secretId, projectId])
  if (rows.length === 0) throw new AppError('Secret not found', 404)

  // Fetch and decrypt current version value
  const [versions] = await pool.execute(q.getCurrentVersion, [secretId])
  const decryptedValue = versions.length > 0 ? decrypt(versions[0].value) : null

  return { ...rows[0], value: decryptedValue, environment: versions[0]?.environment }
}

const createSecret = async (userId, projectId, { key, value, environment, expires_at }, ipAddress) => {
  // Check for duplicate key in this project
  const [existing] = await pool.execute(q.findByKey, [key, projectId])
  if (existing.length > 0) throw new AppError(`A secret with key '${key}' already exists`, 409)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(q.createSecret, [
      projectId, key, expires_at || null, userId,
    ])
    const secretId = result.insertId

    // Encrypt value before storing
    const encryptedValue = encrypt(value)
    await connection.execute(q.createSecretVersion, [
      secretId, 1, encryptedValue, environment, userId,
    ])

    await connection.commit()

    await logAction({
      userId, projectId, secretId,
      action: 'secret.created',
      newValue: JSON.stringify({ key, environment }),
      ipAddress,
    })

    return getSecretById(projectId, secretId)
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

const updateSecret = async (userId, projectId, secretId, { expires_at }, ipAddress) => {
  const [result] = await pool.execute(q.updateSecret, [expires_at || null, secretId])
  if (result.affectedRows === 0) throw new AppError('Secret not found', 404)

  await logAction({ userId, projectId, secretId, action: 'secret.updated', ipAddress })

  return getSecretById(projectId, secretId)
}

const rotateSecret = async (userId, projectId, secretId, { value, environment }, ipAddress) => {
  const [secrets] = await pool.execute(q.findById, [secretId, projectId])
  if (secrets.length === 0) throw new AppError('Secret not found', 404)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Bump the version number on the secret
    await connection.execute(q.incrementVersion, [secretId])

    // Get the new version number
    const newVersion = secrets[0].current_version + 1

    // Insert new encrypted version
    const encryptedValue = encrypt(value)
    await connection.execute(q.createSecretVersion, [
      secretId, newVersion, encryptedValue, environment, userId,
    ])

    await connection.commit()

    await logAction({
      userId, projectId, secretId,
      action: 'secret.rotated',
      newValue: JSON.stringify({ version: newVersion, environment }),
      ipAddress,
    })

    return getSecretById(projectId, secretId)
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

const getSecretVersions = async (projectId, secretId, query) => {
  const { page, limit, offset } = getPagination(query)

  // Confirm secret belongs to this project
  const [secrets] = await pool.execute(q.findById, [secretId, projectId])
  if (secrets.length === 0) throw new AppError('Secret not found', 404)

  // const [rows] = await pool.execute(q.getAllVersions, [secretId, limit, offset])
  const [rows] = await pool.execute(`${q.getAllVersions} LIMIT ${limit} OFFSET ${offset}`, [secretId]);
  const [[{ total }]] = await pool.execute(q.countVersions, [secretId])

  // Never return decrypted values in version list
  return paginatedResponse(rows, total, page, limit)
}

const deleteSecret = async (userId, projectId, secretId, ipAddress) => {
  const [result] = await pool.execute(q.softDeleteSecret, [secretId, projectId])
  if (result.affectedRows === 0) throw new AppError('Secret not found', 404)

  await logAction({ userId, projectId, secretId, action: 'secret.deleted', ipAddress })
}

export { getAllSecrets, getSecretById, createSecret, updateSecret, rotateSecret, getSecretVersions, deleteSecret }

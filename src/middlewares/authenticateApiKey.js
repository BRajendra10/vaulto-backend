import { pool } from '../db/pool.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

/**
 * authenticateApiKey — verifies the project API key for programmatic access.
 * Expects header: 'x-api-key'
 */
const authenticateApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  const { projectId } = req.params

  if (!apiKey) {
    throw new AppError('API Key is missing. Systems must provide an x-api-key header.', 401)
  }

  const [projects] = await pool.execute(
    `SELECT id FROM project WHERE id = ? AND api_key = ? LIMIT 1`,
    [projectId, apiKey]
  )

  if (projects.length === 0) throw new AppError('Invalid API Key or Project ID', 403)

  next()
})

export default authenticateApiKey
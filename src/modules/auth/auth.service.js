// auth.service.js — business logic only, no req/res here

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { pool } from '../../db/pool.js'
import * as q from './auth.queries.js'
import AppError from '../../utils/AppError.js'

// ── Token helpers ─────────────────────────────────────────────────

const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
}

const generateRefreshToken = () => {
  // Random hex string — not a JWT so it can be fully revoked from DB
  return crypto.randomBytes(64).toString('hex')
}

const getRefreshTokenExpiry = () => {
  // 7 days from now
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)
  return expiry
}

// ── Service functions ─────────────────────────────────────────────

const register = async ({ email, password, ipAddress, userAgent }) => {
  // Check if email is already taken
  const [existing] = await pool.execute(q.findUserByEmail, [email])
  if (existing.length > 0) throw new AppError('An account with this email already exists', 409)

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the user
  const [result] = await pool.execute(q.createUser, [email, hashedPassword])
  const userId = result.insertId

  // Create a session and issue tokens
  const refreshToken = generateRefreshToken()
  await pool.execute(q.createSession, [userId, refreshToken, getRefreshTokenExpiry(), ipAddress, userAgent])
  const accessToken = generateAccessToken(userId, email)

  return { accessToken, refreshToken }
}

const login = async ({ email, password, ipAddress, userAgent }) => {
  // Find the user — use a generic error message so we don't reveal if email exists
  const [rows] = await pool.execute(q.findUserByEmail, [email])
  if (rows.length === 0) throw new AppError('Invalid email or password', 401)

  const user = rows[0]

  // Verify password against stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) throw new AppError('Invalid email or password', 401)

  // Create a new session and issue tokens
  const refreshToken = generateRefreshToken()
  await pool.execute(q.createSession, [user.id, refreshToken, getRefreshTokenExpiry(), ipAddress, userAgent])
  const accessToken = generateAccessToken(user.id, user.email)

  return { accessToken, refreshToken }
}

const refreshAccessToken = async (refreshToken) => {
  // Find the session — query already checks expiry_at > NOW()
  const [rows] = await pool.execute(q.findSessionByRefreshToken, [refreshToken])
  if (rows.length === 0) throw new AppError('Invalid or expired refresh token', 401)

  const session = rows[0]

  // Token rotation — delete old refresh token and issue a new one
  // This means a stolen refresh token can only be used once
  const newRefreshToken = generateRefreshToken()
  await pool.execute(q.deleteSession, [refreshToken])
  await pool.execute(q.createSession, [session.user_id, newRefreshToken, getRefreshTokenExpiry(), session.ip_address, session.user_agent])

  const accessToken = generateAccessToken(session.user_id, session.email)
  return { accessToken, refreshToken: newRefreshToken }
}

const logout = async (refreshToken) => {
  await pool.execute(q.deleteSession, [refreshToken])
}

const logoutAll = async (userId) => {
  await pool.execute(q.deleteAllUserSessions, [userId])
}

export { register, login, refreshAccessToken, logout, logoutAll }

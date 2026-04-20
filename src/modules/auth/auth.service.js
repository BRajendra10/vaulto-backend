// auth.service.js — business logic only, no req/res here

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { pool } from '../../db/pool.js'
import * as q from './auth.queries.js'
import AppError from '../../utils/AppError.js'
import * as otpQ from './otp.queries.js'
import { generateOTP, hashToken } from '../../utils/crypto.js'
import { sendOTPEmail } from '../../utils/mailer.js'

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

const register = async ({ email, password }) => {
  // Check if email is already taken
  const [existing] = await pool.execute(q.findUserByEmail, [email])
  if (existing.length > 0) throw new AppError('An account with this email already exists', 409)

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 12)

  // Get default avatar values
  const avatar = process.env.DEFAULT_AVATAR_URL
  const avatarPublicId = process.env.DEFAULT_AVATAR_PUBLIC_ID

  // Create the user
  const [result] = await pool.execute(q.createUser, [email, hashedPassword, avatar, avatarPublicId])
  const userId = result.insertId

  // Generate OTP
  const otp = generateOTP()
  const otpHash = hashToken(otp)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  // Delete existing OTP (if any) — ensures clean state
  await pool.execute(otpQ.deleteOTPByUserId, [userId])

  await pool.execute(otpQ.createOTP, [userId, otpHash, expiresAt])
  await sendOTPEmail(email, otp)

  return { message: 'Registration successful. Please check your email to verify your account.' }
}

const verifyEmailOTP = async ({ email, otp, ipAddress, userAgent }) => {
  const [users] = await pool.execute(q.findUserByEmail, [email])
  if (users.length === 0) throw new AppError('Invalid email or OTP', 401)
  const user = users[0]

  const [otpRows] = await pool.execute(otpQ.findOTPByUserId, [user.id])
  if (otpRows.length === 0) throw new AppError('Invalid or expired OTP', 401)

  const { otp_hash, expires_at } = otpRows[0]

  if (new Date() > new Date(expires_at)) {
    await pool.execute(otpQ.deleteOTPByUserId, [user.id])
    throw new AppError('OTP has expired', 401)
  }

  if (hashToken(otp) !== otp_hash) {
    throw new AppError('Invalid email or OTP', 401)
  }

  const refreshToken = generateRefreshToken()
  const refreshTokenHash = hashToken(refreshToken)
  const accessToken = generateAccessToken(user.id, user.email)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(q.verifyUserEmail, [user.id])
    await connection.execute(otpQ.deleteOTPByUserId, [user.id])
    await connection.execute(q.createSession, [user.id, refreshTokenHash, getRefreshTokenExpiry(), ipAddress, userAgent])
    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return { accessToken, refreshToken }
}

const resendOTP = async (email) => {
  const [users] = await pool.execute(q.findUserByEmail, [email])
  
  // Generic success message to prevent email enumeration
  if (users.length === 0) {
    return { message: 'If an account exists with this email, a new OTP has been sent.' }
  }

  const user = users[0]
  if (user.is_email_verified) {
    throw new AppError('This email is already verified', 400)
  }

  // Delete existing OTP if any
  await pool.execute(otpQ.deleteOTPByUserId, [user.id])

  const otp = generateOTP()
  const otpHash = hashToken(otp)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await pool.execute(otpQ.createOTP, [user.id, otpHash, expiresAt])
  await sendOTPEmail(email, otp)

  return { message: 'If an account exists with this email, a new OTP has been sent.' }
}

const login = async ({ email, password, ipAddress, userAgent }) => {
  // Find the user — use a generic error message so we don't reveal if email exists
  const [rows] = await pool.execute(q.findUserByEmail, [email])
  if (rows.length === 0) throw new AppError('Invalid email or password', 401)

  const user = rows[0]

  // Enforce email verification
  if (!user.is_email_verified) throw new AppError('Please verify your email first', 403)

  // Verify password against stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) throw new AppError('Invalid email or password', 401)

  // Create a new session and issue tokens
  const refreshToken = generateRefreshToken()
  const refreshTokenHash = hashToken(refreshToken)
  await pool.execute(q.createSession, [user.id, refreshTokenHash, getRefreshTokenExpiry(), ipAddress, userAgent])
  const accessToken = generateAccessToken(user.id, user.email)

  return { accessToken, refreshToken }
}

const refreshAccessToken = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken)
  const [rows] = await pool.execute(q.findSessionByRefreshToken, [tokenHash])
  
  if (rows.length === 0) throw new AppError('Invalid session', 401)
  
  const session = rows[0]

  // REUSE DETECTION: If token is revoked, someone reused an old token. Compromise!
  if (session.is_revoked) {
    await pool.execute(q.deleteAllUserSessions, [session.user_id])
    throw new AppError('Security compromise detected. All sessions revoked. Please log in again.', 403)
  }

  // Expiry check
  if (new Date() > new Date(session.expiry_at)) {
    await pool.execute(q.deleteSession, [tokenHash])
    throw new AppError('Session expired', 401)
  }

  // Rotate Token: Revoke current and issue new
  const newRefreshToken = generateRefreshToken()
  const newHash = hashToken(newRefreshToken)

  await pool.execute(q.revokeSession, [tokenHash])
  await pool.execute(q.createSession, [session.user_id, newHash, getRefreshTokenExpiry(), session.ip_address, session.user_agent])

  const accessToken = generateAccessToken(session.user_id, session.email)
  return { accessToken, refreshToken: newRefreshToken }
}

const logout = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken)
  await pool.execute(q.deleteSession, [tokenHash])
}

const logoutAll = async (userId) => {
  await pool.execute(q.deleteAllUserSessions, [userId])
}

export { register, verifyEmailOTP, resendOTP, login, refreshAccessToken, logout, logoutAll }

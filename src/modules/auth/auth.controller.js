// auth.controller.js — request/response only, no business logic here

import { validationResult } from 'express-validator'
import * as authService from './auth.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

// Helper to set the access token as a httpOnly cookie (for browser clients)
// httpOnly = JS on the page cannot read this cookie (XSS protection)
// secure   = only sent over HTTPS in production
// sameSite = protects against CSRF attacks
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
}

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, 
  })
}

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    path: '/api/v1/auth/refresh', // Restricted path
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// ── POST /api/v1/auth/register ────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const { email, password } = req.body
  const result = await authService.register({ email, password })

  res.status(201).json({
    status: 'success',
    message: result.message,
  })
})

// ── POST /api/v1/auth/verify-email ────────────────────────────────
const verifyEmailOTP = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const { email, otp } = req.body

  const { accessToken, refreshToken } = await authService.verifyEmailOTP({
    email, 
    otp,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })

  setAccessTokenCookie(res, accessToken)
  setRefreshTokenCookie(res, refreshToken)

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully.',
  })
})

// ── POST /api/v1/auth/resend-otp ──────────────────────────────────
const resendOTP = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const { email } = req.body

  const result = await authService.resendOTP(email)

  res.status(200).json({
    status: 'success',
    message: result.message,
  })
})

// ── POST /api/v1/auth/login ───────────────────────────────────────
const login = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const { email, password } = req.body
  const { accessToken, refreshToken } = await authService.login({
    email, password,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })

  setAccessTokenCookie(res, accessToken)
  setRefreshTokenCookie(res, refreshToken)

  res.status(200).json({
    status: 'success',
  })
})

// ── POST /api/v1/auth/refresh ─────────────────────────────────────
const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) throw new AppError('Refresh token is required', 400)

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken)

  setAccessTokenCookie(res, accessToken)
  setRefreshTokenCookie(res, newRefreshToken)

  res.status(200).json({ status: 'success' })
})

// ── POST /api/v1/auth/logout ──────────────────────────────────────
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (refreshToken) {
    await authService.logout(refreshToken)
  }

  res.clearCookie('accessToken', COOKIE_OPTIONS)
  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/v1/auth/refresh' })

  res.status(200).json({ status: 'success', message: 'Logged out successfully' })
})

// ── POST /api/v1/auth/logout-all ─────────────────────────────────
const logoutAll = catchAsync(async (req, res) => {
  // req.user is set by authenticate middleware
  await authService.logoutAll(req.user.id)

  res.clearCookie('accessToken')

  res.status(200).json({ status: 'success', message: 'All sessions revoked' })
})

export { register, verifyEmailOTP, resendOTP, login, refresh, logout, logoutAll }

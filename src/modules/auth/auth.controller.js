// auth.controller.js — request/response only, no business logic here

import { validationResult } from 'express-validator'
import * as authService from './auth.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

// Helper to set the access token as a httpOnly cookie (for browser clients)
// httpOnly = JS on the page cannot read this cookie (XSS protection)
// secure   = only sent over HTTPS in production
// sameSite = protects against CSRF attacks
const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes in ms — matches JWT expiry
  })
}

// ── POST /api/v1/auth/register ────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const { email, password } = req.body
  const { accessToken, refreshToken } = await authService.register({
    email, password,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })

  setAccessTokenCookie(res, accessToken)

  res.status(201).json({
    status: 'success',
    // refreshToken goes in the body — client stores it (localStorage or memory)
    // accessToken goes in cookie — browser handles it automatically
    data: { refreshToken },
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

  res.status(200).json({
    status: 'success',
    data: { refreshToken },
  })
})

// ── POST /api/v1/auth/refresh ─────────────────────────────────────
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw new AppError('Refresh token is required', 400)

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken)

  // Set new access token in cookie and return new refresh token
  setAccessTokenCookie(res, accessToken)

  res.status(200).json({
    status: 'success',
    data: { refreshToken: newRefreshToken },
  })
})

// ── POST /api/v1/auth/logout ──────────────────────────────────────
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw new AppError('Refresh token is required', 400)

  await authService.logout(refreshToken)

  // Clear the access token cookie
  res.clearCookie('accessToken')

  res.status(200).json({ status: 'success', message: 'Logged out successfully' })
})

// ── POST /api/v1/auth/logout-all ─────────────────────────────────
const logoutAll = catchAsync(async (req, res) => {
  // req.user is set by authenticate middleware
  await authService.logoutAll(req.user.id)

  res.clearCookie('accessToken')

  res.status(200).json({ status: 'success', message: 'All sessions revoked' })
})

export { register, login, refresh, logout, logoutAll }

import { Router } from 'express'
import { body } from 'express-validator'
import { register, verifyEmailOTP, resendOTP, login, refresh, logout, logoutAll } from './auth.controller.js'
import authenticate from '../../middlewares/authenticate.js'

const router = Router()

// ── Validation rules ──────────────────────────────────────────────
const registerValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

const verifyEmailValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
]

const resendOTPValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
]

// ── Routes ────────────────────────────────────────────────────────
router.post('/register',    registerValidation, register)
router.post('/verify-email', verifyEmailValidation, verifyEmailOTP)
router.post('/resend-otp',   resendOTPValidation,    resendOTP)
router.post('/login',       loginValidation,    login)
router.post('/refresh',                         refresh)
router.post('/logout',                          logout)
router.post('/logout-all',  authenticate,       logoutAll)

export default router

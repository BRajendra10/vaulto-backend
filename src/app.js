import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import errorHandler from './middlewares/errorHandler.js'
import AppError from './utils/AppError.js'

import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import projectsRoutes from './modules/projects/projects.routes.js'
import maintainersRoutes from './modules/maintainers/maintainers.routes.js'
import secretsRoutes from './modules/secrets/secrets.routes.js'
import auditRoutes from './modules/audit/audit.routes.js'

const app = express()

// ── Global Middlewares ──────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// ── Health Check ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/users',    usersRoutes)
app.use('/api/v1/projects', projectsRoutes)
app.use('/api/v1/projects', maintainersRoutes)
app.use('/api/v1/projects', secretsRoutes)
app.use('/api/v1/projects', auditRoutes)

// ── 404 Handler ─────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// ── Global Error Handler ────────────────────────────────────────
app.use(errorHandler)

export default app

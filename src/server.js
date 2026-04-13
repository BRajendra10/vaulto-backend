import app from './app.js'
import { testConnection } from './db/pool.js'

const PORT = process.env.PORT || 3000
const ENV = process.env.NODE_ENV || 'development'

const startServer = async () => {
  // Test DB connection before accepting any traffic
  await testConnection()

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${ENV}]`)
  })

  // Graceful shutdown — finish in-flight requests before exiting
  // instead of killing the process abruptly (important in production)
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))  // e.g. docker stop
  process.on('SIGINT',  () => shutdown('SIGINT'))   // e.g. Ctrl+C

  // Catch any unhandled promise rejections (forgotten await, etc.)
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION 💥', err)
    server.close(() => process.exit(1))
  })
}

startServer()

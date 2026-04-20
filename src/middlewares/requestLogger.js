const requestLogger = (req, res, next) => {
  const start = Date.now()

  // 'finish' fires when the response has been sent
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`)
  })

  next()
}

export default requestLogger

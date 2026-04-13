import config from '../config/index.js'

// Global error handler — every error in the app ends up here
// via next(err) or by catchAsync forwarding it automatically.
//
// We always send back exactly three fields:
//   statusCode — what went wrong at the HTTP level
//   message    — human readable reason
//   errors     — field-level validation errors if any (e.g. from express-validator)

const errorHandler = (err, req, res, next) => {
  // 1. Set defaults if the error doesn't have them
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const errors = err.errors || []

  // 2. If this is NOT an operational error (i.e. it's a bug or crash),
  //    log it so we know about it — operational errors are expected and don't need logging
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR 💥', err)
  }

  // 3. Always send a clean response back to the client
  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
  })
}

export default errorHandler

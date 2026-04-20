class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors        // optional array of field-level validation errors
    this.isOperational = true   // marks this as a known, expected error (vs a bug)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError

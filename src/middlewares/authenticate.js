import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

// authenticate — verifies the access token and attaches the user payload to req.user
//
// We support two ways to send the token:
//   1. Cookie (browser) — token is in a httpOnly cookie called 'accessToken'
//      httpOnly means JS on the page can't read it, which protects against XSS attacks.
//      The browser sends it automatically on every request — no frontend code needed.
//   2. Authorization header (mobile / API clients) — 'Authorization: Bearer <token>'
//      Mobile apps can't use cookies the same way browsers do, so they send the token manually.

const authenticate = catchAsync(async (req, res, next) => {
  let token

  // 1. Check cookie first (browser clients)
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken
  }

  // 2. Fall back to Authorization header (mobile / API clients)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // 3. No token found in either place — reject the request
  if (!token) {
    throw new AppError('You are not logged in. Please log in to get access.', 401)
  }

  // 4. Verify the token is valid and not expired
  //    jwt.verify throws an error automatically if invalid — catchAsync will catch it
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // 5. Attach the decoded payload to req so downstream middlewares and
  //    controllers can access the logged-in user without hitting the DB again
  req.user = decoded // { id, email, iat, exp }

  next()
})

export default authenticate

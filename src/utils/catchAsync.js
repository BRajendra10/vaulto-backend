// Wraps an async controller function so you don't need try/catch in every route.
// Any error thrown inside will be forwarded to Express's error handler automatically.
//
// Usage:
//   const getUser = catchAsync(async (req, res) => {
//     const user = await usersService.getById(req.params.id)
//     res.json(user)
//   })

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default catchAsync

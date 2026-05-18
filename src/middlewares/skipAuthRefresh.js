const skipAuthRefresh = (req, res, next) => {
  // Used by the frontend axios interceptor to bypass refresh recursion.
  // Sets a request-scoped flag only; no behavior changes on backend routes.
  req.skipAuthRefresh = true
  next()
}

export default skipAuthRefresh


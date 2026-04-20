// Parses page + limit from query string and returns offset for SQL
// Usage: const { limit, offset, page } = getPagination(req.query)
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

// Wraps data in a standard paginated response shape
const paginatedResponse = (data, total, page, limit) => ({
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
})

export { getPagination, paginatedResponse }

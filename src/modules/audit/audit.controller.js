import * as auditService from './audit.service.js'
import catchAsync from '../../utils/catchAsync.js'

const getAuditLog = catchAsync(async (req, res) => {
  const data = await auditService.getAuditLog(req.params.projectId, req.query)
  res.status(200).json({ status: 'success', ...data })
})

export { getAuditLog }

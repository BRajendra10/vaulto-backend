import { Router } from 'express'
import * as auditController from './audit.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import authorize from '../../middlewares/authorize.js'

const router = Router()

router.get('/:projectId/audit',
  authenticate, authorize('member:manage'),
  auditController.getAuditLog
)

export default router

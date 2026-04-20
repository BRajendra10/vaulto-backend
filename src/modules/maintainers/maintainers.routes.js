import { Router } from 'express'
import { body, param } from 'express-validator'
import * as maintainersController from './maintainers.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import authorize from '../../middlewares/authorize.js'

const router = Router()

const VALID_ROLES = ['viewer', 'developer', 'admin']

router.get('/:projectId/maintainers',
  authenticate, authorize('secret:read'),
  [param('projectId').isInt().toInt()],
  maintainersController.getAllMaintainers
)

router.post('/:projectId/maintainers',
  authenticate, authorize('member:manage'),
  [
    param('projectId').isInt().toInt(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`),
  ],
  maintainersController.addMaintainer
)

router.patch('/:projectId/maintainers/:userId',
  authenticate, authorize('member:manage'),
  [
    param('projectId').isInt().toInt(),
    param('userId').isInt().toInt(),
    body('role').isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`)
  ],
  maintainersController.updateRole
)

router.delete('/:projectId/maintainers/:userId',
  authenticate, authorize('member:manage'),
  [
    param('projectId').isInt().toInt(),
    param('userId').isInt().toInt(),
  ],
  maintainersController.removeMaintainer
)

export default router

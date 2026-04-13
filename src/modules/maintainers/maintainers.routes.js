import { Router } from 'express'
import { body } from 'express-validator'
import * as maintainersController from './maintainers.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import authorize from '../../middlewares/authorize.js'

const router = Router()

const VALID_ROLES = ['viewer', 'developer', 'admin']

router.get('/:projectId/maintainers',
  authenticate, authorize('secret:read'),
  maintainersController.getAllMaintainers
)

router.post('/:projectId/maintainers',
  authenticate, authorize('member:manage'),
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`),
  ],
  maintainersController.addMaintainer
)

router.patch('/:projectId/maintainers/:userId',
  authenticate, authorize('member:manage'),
  [body('role').isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`)],
  maintainersController.updateRole
)

router.delete('/:projectId/maintainers/:userId',
  authenticate, authorize('member:manage'),
  maintainersController.removeMaintainer
)

export default router

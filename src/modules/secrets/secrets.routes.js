import { Router } from 'express'
import { body } from 'express-validator'
import * as secretsController from './secrets.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import authorize from '../../middlewares/authorize.js'

const router = Router()

const VALID_ENVIRONMENTS = ['development', 'staging', 'production']

const secretValueValidation = [
  body('key').trim().notEmpty().withMessage('Key is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('environment').isIn(VALID_ENVIRONMENTS).withMessage(`Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}`),
  body('expires_at').optional().isISO8601().withMessage('expires_at must be a valid date'),
]

const rotateValidation = [
  body('value').notEmpty().withMessage('New value is required'),
  body('environment').isIn(VALID_ENVIRONMENTS).withMessage(`Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}`),
]

router.get('/:projectId/secrets',
  authenticate, authorize('secret:read'),
  secretsController.getAllSecrets
)

router.post('/:projectId/secrets',
  authenticate, authorize('secret:create'),
  secretValueValidation,
  secretsController.createSecret
)

router.get('/:projectId/secrets/:secretId',
  authenticate, authorize('secret:read'),
  secretsController.getSecretById
)

router.patch('/:projectId/secrets/:secretId',
  authenticate, authorize('secret:update'),
  secretsController.updateSecret
)

router.post('/:projectId/secrets/:secretId/rotate',
  authenticate, authorize('secret:rotate'),
  rotateValidation,
  secretsController.rotateSecret
)

router.get('/:projectId/secrets/:secretId/versions',
  authenticate, authorize('secret:read'),
  secretsController.getSecretVersions
)

router.delete('/:projectId/secrets/:secretId',
  authenticate, authorize('secret:delete'),
  secretsController.deleteSecret
)

export default router

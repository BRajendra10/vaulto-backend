import { Router } from 'express'
import { body } from 'express-validator'
import * as usersController from './users.controller.js'
import authenticate from '../../middlewares/authenticate.js'

const router = Router()

router.use(authenticate)

router.get('/me', usersController.getMe)

router.patch('/me',
  [body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')],
  usersController.updateProfile
)

router.patch('/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  usersController.updatePassword
)

export default router

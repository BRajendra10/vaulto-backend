import { Router } from 'express'
import { body } from 'express-validator'
import * as usersController from './users.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import { upload } from '../../middlewares/uploadAvatar.js'

const router = Router()

const validateProfile = [
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('username')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[^<>\/\\;]*$/).withMessage('Name contains invalid characters'),
]

const passwordUpdateValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ]

router.use(authenticate)

router.get('/me', usersController.getMe)

router.patch('/avatar', upload.single('avatar'), usersController.updateAvatar)

router.patch('/me',
  validateProfile,
  usersController.updateProfile
)

router.patch('/me/password',
  passwordUpdateValidation,
  usersController.updatePassword
)

export default router

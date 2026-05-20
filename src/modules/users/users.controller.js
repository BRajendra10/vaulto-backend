import { validationResult } from 'express-validator'
import * as usersService from './users.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

const getMe = catchAsync(async (req, res) => {
  const user = await usersService.getMe(req.user.id)
  res.status(200).json({ status: 'success', data: user })
})

const updateProfile = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const user = await usersService.updateProfile(req.user.id, req.body)
  res.status(200).json({ status: 'success', data: user })
})

const updatePassword = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  await usersService.updatePassword(req.user.id, req.body)
  res.status(200).json({ status: 'success', message: 'Password updated successfully' })
})

const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('Avatar image is required', 400)

  const data = await usersService.updateAvatar(req.user.id, req.file.path)

  res.status(200).json({
    status: 'success',
    message: 'Avatar updated successfully',
    data,
  })
})

export { getMe, updateProfile, updatePassword, updateAvatar }

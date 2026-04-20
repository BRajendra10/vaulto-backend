import { validationResult } from 'express-validator'
import * as maintainersService from './maintainers.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

const getAllMaintainers = catchAsync(async (req, res) => {
  const data = await maintainersService.getAllMaintainers(req.params.projectId, req.query)
  res.status(200).json({ status: 'success', ...data })
})

const addMaintainer = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const maintainer = await maintainersService.addMaintainer(req.user.id, req.params.projectId, req.body, req.ip)
  res.status(201).json({ status: 'success', data: maintainer })
})

const updateRole = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  await maintainersService.updateRole(req.user.id, req.params.projectId, req.params.userId, req.body, req.ip)
  res.status(200).json({ status: 'success', message: 'Role updated successfully' })
})

const removeMaintainer = catchAsync(async (req, res) => {
  await maintainersService.removeMaintainer(req.user.id, req.params.projectId, req.params.userId, req.ip)
  res.status(200).json({ status: 'success', message: 'Member removed successfully' })
})

export { getAllMaintainers, addMaintainer, updateRole, removeMaintainer }

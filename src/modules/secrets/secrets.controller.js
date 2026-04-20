import { validationResult } from 'express-validator'
import * as secretsService from './secrets.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

const getAllSecrets = catchAsync(async (req, res) => {
  const data = await secretsService.getAllSecrets(req.params.projectId, req.query)
  res.status(200).json({ status: 'success', ...data })
})

const getSecretById = catchAsync(async (req, res) => {
  const secret = await secretsService.getSecretById(req.params.projectId, req.params.secretId)
  res.status(200).json({ status: 'success', data: secret })
})

const createSecret = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const secret = await secretsService.createSecret(req.user.id, req.params.projectId, req.body, req.ip)
  res.status(201).json({ status: 'success', data: secret })
})

const updateSecret = catchAsync(async (req, res) => {
  const secret = await secretsService.updateSecret(req.user.id, req.params.projectId, req.params.secretId, req.body, req.ip)
  res.status(200).json({ status: 'success', data: secret })
})

const rotateSecret = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const secret = await secretsService.rotateSecret(req.user.id, req.params.projectId, req.params.secretId, req.body, req.ip)
  res.status(200).json({ status: 'success', data: secret })
})

const getSecretVersions = catchAsync(async (req, res) => {
  const data = await secretsService.getSecretVersions(req.params.projectId, req.params.secretId, req.query)
  res.status(200).json({ status: 'success', ...data })
})

const deleteSecret = catchAsync(async (req, res) => {
  await secretsService.deleteSecret(req.user.id, req.params.projectId, req.params.secretId, req.ip)
  res.status(200).json({ status: 'success', message: 'Secret deleted successfully' })
})

export { getAllSecrets, getSecretById, createSecret, updateSecret, rotateSecret, getSecretVersions, deleteSecret }

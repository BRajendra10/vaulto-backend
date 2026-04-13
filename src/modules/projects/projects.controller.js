import { validationResult } from 'express-validator'
import * as projectsService from './projects.service.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/AppError.js'

const getAllProjects = catchAsync(async (req, res) => {
  const data = await projectsService.getAllProjects(req.user.id, req.query)
  res.status(200).json({ status: 'success', ...data })
})

const getProjectById = catchAsync(async (req, res) => {
  const project = await projectsService.getProjectById(req.params.projectId)
  res.status(200).json({ status: 'success', data: project })
})

const createProject = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const project = await projectsService.createProject(req.user.id, req.body, req.ip)
  res.status(201).json({ status: 'success', data: project })
})

const updateProject = catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, errors.array())

  const project = await projectsService.updateProject(req.user.id, req.params.projectId, req.body, req.ip)
  res.status(200).json({ status: 'success', data: project })
})

const deleteProject = catchAsync(async (req, res) => {
  await projectsService.deleteProject(req.user.id, req.params.projectId, req.ip)
  res.status(200).json({ status: 'success', message: 'Project deleted successfully' })
})

export { getAllProjects, getProjectById, createProject, updateProject, deleteProject }

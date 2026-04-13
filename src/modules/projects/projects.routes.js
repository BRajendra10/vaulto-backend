import { Router } from 'express'
import { body } from 'express-validator'
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject } from './projects.controller.js'
import authenticate from '../../middlewares/authenticate.js'
import authorize from '../../middlewares/authorize.js'

const router = Router()

const projectNameValidation = [
  body('project_name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name must be under 100 characters'),
]

router.get('/', authenticate, getAllProjects)
router.post('/', authenticate, projectNameValidation, createProject)
router.get('/:projectId', authenticate, getProjectById)
router.patch('/:projectId', authenticate, authorize('member:manage'), projectNameValidation, updateProject)
router.delete('/:projectId', authenticate, authorize('project:delete'), deleteProject)

export default router

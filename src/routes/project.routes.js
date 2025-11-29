import express from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats/dashboard', projectController.getDashboardStats);

// Get user's projects
router.get('/my-projects', projectController.getProjectsByUser);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Comment routes (all authenticated users can comment)
router.post('/:id/comments', projectController.addComment);
router.delete('/:id/comments/:commentId', projectController.deleteComment);

// Admin-only routes
router.post('/', authorizeRole('admin'), projectController.createProject);
router.put('/:id', authorizeRole('admin'), projectController.updateProject);
router.delete('/:id', authorizeRole('admin'), projectController.deleteProject);

export default router;

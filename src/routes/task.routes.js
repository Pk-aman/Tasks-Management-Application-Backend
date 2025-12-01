import express from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Create task/subtask
router.post('/', taskController.createTask);

// Update task
router.put('/:id', taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Comment routes
router.post('/:id/comments', taskController.addComment);
router.delete('/:id/comments/:commentId', taskController.deleteComment);

export default router;

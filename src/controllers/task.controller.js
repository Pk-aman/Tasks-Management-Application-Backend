import Task from '../models/Task.model.js';
import Comment from '../models/Comment.model.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';

export const taskController = {
  // Get all tasks for a project
  async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params;

      const tasks = await Task.find({ project: projectId, parentTask: null })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Get subtask counts
      const tasksWithSubtasks = await Promise.all(
        tasks.map(async (task) => {
          const subtaskCount = await Task.countDocuments({ parentTask: task._id });
          const taskObj = task.toObject();
          taskObj.subtaskCount = subtaskCount;
          return taskObj;
        })
      );

      res.status(200).json({
        success: true,
        tasks: tasksWithSubtasks,
      });
    } catch (error) {
      console.error('Get tasks by project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
      });
    }
  },

  // Get task by ID
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .populate('project', 'title members assignee');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      // Get comments
      const comments = await Comment.find({ task: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      // Get subtasks
      const subtasks = await Task.find({ parentTask: id })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

      const taskObj = task.toObject();
      taskObj.comments = comments;
      taskObj.subtasks = subtasks;

      res.status(200).json({
        success: true,
        task: taskObj,
      });
    } catch (error) {
      console.error('Get task by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task',
      });
    }
  },

  // Create new task or subtask
  async createTask(req, res) {
    try {
      const {
        title,
        description,
        acceptanceCriteria,
        project,
        parentTask,
        members,
        deadline,
        status,
        assignee,
      } = req.body;

      if (!title || !description || !acceptanceCriteria || !deadline || !assignee) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
        });
      }

      // Verify project exists
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // If parentTask provided, verify it exists
      if (parentTask) {
        const parentTaskExists = await Task.findById(parentTask);
        if (!parentTaskExists) {
          return res.status(404).json({
            success: false,
            message: 'Parent task not found',
          });
        }
      }

      // Verify assignee exists
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found',
        });
      }

      // Verify members exist
      if (members && members.length > 0) {
        const memberUsers = await User.find({ _id: { $in: members } });
        if (memberUsers.length !== members.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more members not found',
          });
        }
      }

      const task = await Task.create({
        title,
        description,
        acceptanceCriteria,
        project,
        parentTask: parentTask || null,
        members: members || [],
        deadline,
        status: status || 'new',
        assignee,
        createdBy: req.user.id,
      });

      await task.populate('assignee', 'name email role');
      await task.populate('members', 'name email role');
      await task.populate('createdBy', 'name email');
      await task.populate('project', 'title');

      const taskObj = task.toObject();
      taskObj.comments = [];
      taskObj.subtasks = [];

      res.status(201).json({
        success: true,
        message: `${parentTask ? 'Subtask' : 'Task'} created successfully`,
        task: taskObj,
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create task',
      });
    }
  },

  // Update task
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      if (updateData.assignee) {
        const assigneeUser = await User.findById(updateData.assignee);
        if (!assigneeUser) {
          return res.status(404).json({
            success: false,
            message: 'Assignee not found',
          });
        }
      }

      if (updateData.members && updateData.members.length > 0) {
        const memberUsers = await User.find({ _id: { $in: updateData.members } });
        if (memberUsers.length !== updateData.members.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more members not found',
          });
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .populate('project', 'title');

      const comments = await Comment.find({ task: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const subtasks = await Task.find({ parentTask: id })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

      const taskObj = updatedTask.toObject();
      taskObj.comments = comments;
      taskObj.subtasks = subtasks;

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: taskObj,
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task',
      });
    }
  },

  // Delete task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      // Delete all subtasks
      await Task.deleteMany({ parentTask: id });

      // Delete all comments
      await Comment.deleteMany({ task: id });

      // Delete the task
      await Task.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Task and associated data deleted successfully',
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete task',
      });
    }
  },

  // Add comment to task
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text || text.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required',
        });
      }

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      const comment = await Comment.create({
        text: text.trim(),
        sentBy: req.user.id,
        task: id,
        project: null,
      });

      await comment.populate('sentBy', 'name email role');

      const updatedTask = await Task.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .populate('project', 'title');

      const comments = await Comment.find({ task: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const subtasks = await Task.find({ parentTask: id })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

      const taskObj = updatedTask.toObject();
      taskObj.comments = comments;
      taskObj.subtasks = subtasks;

      res.status(200).json({
        success: true,
        message: 'Comment added successfully',
        task: taskObj,
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
      });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      if (comment.task.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Comment does not belong to this task',
        });
      }

      if (comment.sentBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments',
        });
      }

      await Comment.findByIdAndDelete(commentId);

      const task = await Task.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .populate('project', 'title');

      const comments = await Comment.find({ task: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const subtasks = await Task.find({ parentTask: id })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

      const taskObj = task.toObject();
      taskObj.comments = comments;
      taskObj.subtasks = subtasks;

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        task: taskObj,
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
      });
    }
  },
};

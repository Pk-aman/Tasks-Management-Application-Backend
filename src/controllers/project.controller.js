import Project from '../models/Project.model.js';
import Comment from '../models/Comment.model.js';
import User from '../models/User.model.js';

export const projectController = {
  // Get all projects
  async getAllProjects(req, res) {
    try {
      const projects = await Project.find()
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Get comment counts for each project
      const projectsWithComments = await Promise.all(
        projects.map(async (project) => {
          const commentCount = await Comment.countDocuments({ project: project._id });
          const projectObj = project.toObject();
          projectObj.commentCount = commentCount;
          return projectObj;
        })
      );

      res.status(200).json({
        success: true,
        projects: projectsWithComments,
      });
    } catch (error) {
      console.error('Get all projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
      });
    }
  },

  // Get project by ID
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Get comments for this project
      const comments = await Comment.find({ project: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const projectObj = project.toObject();
      projectObj.comments = comments;

      res.status(200).json({
        success: true,
        project: projectObj,
      });
    } catch (error) {
      console.error('Get project by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
      });
    }
  },

  // Create new project (Admin only)
  async createProject(req, res) {
    try {
      const {
        title,
        description,
        acceptanceCriteria,
        members,
        deadline,
        clientDetails,
        status,
        assignee,
      } = req.body;

      if (!title || !description || !acceptanceCriteria || !deadline || !assignee) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
        });
      }

      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found',
        });
      }

      if (members && members.length > 0) {
        const memberUsers = await User.find({ _id: { $in: members } });
        if (memberUsers.length !== members.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more members not found',
          });
        }
      }

      const project = await Project.create({
        title,
        description,
        acceptanceCriteria,
        members: members || [],
        deadline,
        clientDetails,
        status: status || 'new',
        assignee,
        createdBy: req.user.id,
      });

      await project.populate('assignee', 'name email role');
      await project.populate('members', 'name email role');
      await project.populate('createdBy', 'name email');

      const projectObj = project.toObject();
      projectObj.comments = [];
      projectObj.commentCount = 0;

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project: projectObj,
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create project',
      });
    }
  },

  // Update project (Admin only)
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
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

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

      // Get comments
      const comments = await Comment.find({ project: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const projectObj = updatedProject.toObject();
      projectObj.comments = comments;

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project: projectObj,
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update project',
      });
    }
  },

  // Add comment to project
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      console.log('Add comment request:', {
        projectId: id,
        userId: req.user.id,
        text,
      });

      // Validate input
      if (!text || text.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required',
        });
      }

      // Check if project exists
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Create comment
      const comment = await Comment.create({
        text: text.trim(),
        sentBy: req.user.id,
        project: id,
        task: null, // Explicitly set task to null
      });

      console.log('Comment created:', comment);

      // Populate the sender
      await comment.populate('sentBy', 'name email role');

      // Get updated project
      const updatedProject = await Project.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

      // Get all comments
      const comments = await Comment.find({ project: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      console.log('Comments fetched:', comments.length);

      const projectObj = updatedProject.toObject();
      projectObj.comments = comments;

      res.status(200).json({
        success: true,
        message: 'Comment added successfully',
        project: projectObj,
      });
    } catch (error) {
      console.error('Add comment error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add comment',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  },


  // Delete comment from project
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

      // Check if comment belongs to this project
      if (comment.project.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Comment does not belong to this project',
        });
      }

      // Only comment owner or admin can delete
      if (comment.sentBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments',
        });
      }

      await Comment.findByIdAndDelete(commentId);

      // Get updated project with remaining comments
      const project = await Project.findById(id)
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

      const comments = await Comment.find({ project: id })
        .populate('sentBy', 'name email role')
        .sort({ createdAt: -1 });

      const projectObj = project.toObject();
      projectObj.comments = comments;

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        project: projectObj,
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
      });
    }
  },

  // Delete project (Admin only)
  async deleteProject(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Delete all comments associated with this project
      await Comment.deleteMany({ project: id });

      // Delete the project
      await Project.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Project and associated comments deleted successfully',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project',
      });
    }
  },

  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const totalProjects = await Project.countDocuments();
      const activeProjects = await Project.countDocuments({
        status: { $nin: ['close', 'wont-done'] },
      });
      const completedProjects = await Project.countDocuments({ status: 'close' });
      const blockedProjects = await Project.countDocuments({ status: 'block' });

      const allProjects = await Project.find().select('members');
      const uniqueMembers = new Set();
      allProjects.forEach((project) => {
        project.members.forEach((member) => {
          uniqueMembers.add(member.toString());
        });
      });
      const totalMembers = uniqueMembers.size;

      const projectsByStatus = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]);

      res.status(200).json({
        success: true,
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          blockedProjects,
          totalMembers,
          projectsByStatus,
        },
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
      });
    }
  },

  // Get projects by user
  async getProjectsByUser(req, res) {
    try {
      const userId = req.user.id;

      const projects = await Project.find({
        $or: [{ assignee: userId }, { members: userId }, { createdBy: userId }],
      })
        .populate('assignee', 'name email role')
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Get comment counts
      const projectsWithComments = await Promise.all(
        projects.map(async (project) => {
          const commentCount = await Comment.countDocuments({ project: project._id });
          const projectObj = project.toObject();
          projectObj.commentCount = commentCount;
          return projectObj;
        })
      );

      res.status(200).json({
        success: true,
        projects: projectsWithComments,
      });
    } catch (error) {
      console.error('Get projects by user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user projects',
      });
    }
  },
};

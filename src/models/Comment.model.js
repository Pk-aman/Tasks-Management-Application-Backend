import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ sentBy: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

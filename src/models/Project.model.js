import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    acceptanceCriteria: {
      type: String,
      required: [true, 'Acceptance criteria is required'],
      trim: true,
      maxlength: [2000, 'Acceptance criteria cannot exceed 2000 characters'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    clientDetails: {
      type: String,
      trim: true,
      maxlength: [500, 'Client details cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: [
        'new',
        'requirement-gathering',
        'planning',
        'execution',
        'monitoring-and-control',
        'close',
        'block',
        'wont-done',
      ],
      default: 'new',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignee is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get comments for this project
projectSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'project',
  options: { sort: { createdAt: -1 } },
});

// Create indexes
projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ assignee: 1 });
projectSchema.index({ deadline: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

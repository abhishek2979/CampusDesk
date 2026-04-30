const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message:      { type: String, required: true },
  authorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName:   { type: String },
  authorRole:   { type: String },
  createdAt:    { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: { type: String },
    rollNo:      { type: String, default: '' },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['Hostel', 'Sports Complex', 'Library', 'Department', 'Faculty', 'Academic Issues'],
      required: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending'
    },

    assignedTo:         { type: String, default: null },
    adminResponse:      { type: String, default: '' },
    departmentRemarks:  { type: String, default: '' },

    image:      { type: String, default: null },
    replies:    [replySchema],
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Auto-generate complaint ID before first save
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP${String(count + 1).padStart(4, '0')}`;
  }
  if (this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);

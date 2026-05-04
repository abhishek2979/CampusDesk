const Complaint = require('../models/Complaint');

exports.getComplaints = async (req, res) => {
  try {
    const { category, status, priority, page = 1, limit = 15 } = req.query;

    const filter = {};

    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.user.role === 'department') filter.assignedTo = req.user.department;

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('student', 'name rollNo email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name rollNo email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // students can only view their own complaints
    if (req.user.role === 'student') {
      if (complaint.student._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = await Complaint.create({
      student: req.user._id,
      studentName: req.user.name,
      rollNo: req.user.rollNo || '',
      title,
      description,
      category,
      priority: priority || 'Medium',
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    // notify admin in real time
    const io = req.app.get('io');
    io.to('admin').emit('complaint:new', {
      complaintId: complaint.complaintId,
      title: complaint.title,
      studentName: complaint.studentName
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { status, assignedTo, adminResponse, departmentRemarks, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status !== undefined) complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;
    if (departmentRemarks !== undefined) complaint.departmentRemarks = departmentRemarks;
    if (priority !== undefined) complaint.priority = priority;

    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name rollNo email');

    const io = req.app.get('io');
    io.to(updated.student._id.toString()).emit('complaint:updated', updated);
    io.to('admin').emit('complaint:updated', updated);

    res.json({ success: true, complaint: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.replies.push({
      message,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name rollNo email');

    const io = req.app.get('io');
    io.to(updated.student._id.toString()).emit('complaint:reply', {
      complaintId: updated._id,
      reply: updated.replies[updated.replies.length - 1]
    });
    io.to('admin').emit('complaint:reply', { complaintId: updated._id });

    res.json({ success: true, complaint: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const io = req.app.get('io');
    io.to('admin').emit('complaint:deleted', { id: req.params.id });

    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Complaint = require('../models/Complaint');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.user.role === 'department') filter.assignedTo = req.user.department;

    const total      = await Complaint.countDocuments(filter);
    const pending    = await Complaint.countDocuments({ ...filter, status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ ...filter, status: 'In Progress' });
    const resolved   = await Complaint.countDocuments({ ...filter, status: 'Resolved' });
    const rejected   = await Complaint.countDocuments({ ...filter, status: 'Rejected' });

    const byCategory = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentComplaints = await Complaint.find(filter)
      .populate('student', 'name rollNo')
      .sort({ createdAt: -1 })
      .limit(5);

    let extra = {};
    if (req.user.role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalDepts    = await User.countDocuments({ role: 'department' });
      const unassigned    = await Complaint.countDocuments({
        assignedTo: null,
        status: { $nin: ['Resolved', 'Rejected'] }
      });
      extra = { totalStudents, totalDepts, unassigned };
    }

    res.json({
      success: true,
      stats: { total, pending, inProgress, resolved, rejected, byCategory, ...extra },
      recentComplaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

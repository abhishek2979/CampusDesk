const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/departments', protect, (req, res) => {
  res.json({
    success: true,
    departments: [
      'Hostel Office',
      'Sports Department',
      'Library Management',
      'Academic Affairs',
      'Faculty Coordination'
    ]
  });
});

module.exports = router;

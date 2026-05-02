const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const formatUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNo: user.rollNo,
    department: user.department,
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  };
};

// register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNo, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // TODO: add email verification later
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      rollNo,
      department
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// login - students use rollNo, management uses email
exports.login = async (req, res) => {
  try {
    const { rollNo, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    let user;

    if (rollNo) {
      user = await User.findOne({ rollNo: rollNo.trim().toUpperCase(), role: 'student' }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Roll number not found' });
      }
    } else if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Email not found' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Roll number or email is required' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

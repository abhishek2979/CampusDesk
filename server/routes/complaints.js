const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  addReply,
  deleteComplaint
} = require('../controllers/complaintController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  }
});

router.use(protect);

router.get('/',    getComplaints);
router.post('/',   authorize('student'), upload.single('image'), createComplaint);
router.get('/:id', getComplaint);
router.patch('/:id',       authorize('admin', 'department'), updateComplaint);
router.post('/:id/reply',  authorize('admin', 'department'), addReply);
router.delete('/:id',      authorize('admin'), deleteComplaint);

module.exports = router;

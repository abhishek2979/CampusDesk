const User = require('../models/User');
const Complaint = require('../models/Complaint');

module.exports = async function seeder() {
  
  const adminExists = await User.findOne({ email: 'admin@campus.edu' });
  if (adminExists) return;

  console.log('Running seeder...');

  const admin = await User.create({
    name: 'Admin Kumar',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin'
  });

  const john = await User.create({
    name: 'John Mathew',
    email: 'john@student.edu',
    password: 'student123',
    role: 'student',
    rollNo: 'CS2021045'
  });

  const priya = await User.create({
    name: 'Priya Sharma',
    email: 'priya@student.edu',
    password: 'student123',
    role: 'student',
    rollNo: 'EC2021032'
  });

  await User.create([
    { name: 'Hostel Office',        email: 'hostel@campus.edu',     password: 'dept123', role: 'department', department: 'Hostel Office'        },
    { name: 'Sports Department',    email: 'sports@campus.edu',     password: 'dept123', role: 'department', department: 'Sports Department'    },
    { name: 'Library Management',   email: 'library@campus.edu',    password: 'dept123', role: 'department', department: 'Library Management'   },
    { name: 'Academic Affairs',     email: 'academics@campus.edu',  password: 'dept123', role: 'department', department: 'Academic Affairs'     },
    { name: 'Faculty Coordination', email: 'faculty@campus.edu',    password: 'dept123', role: 'department', department: 'Faculty Coordination' }
  ]);

  await Complaint.create([
    {
      student: john._id,
      studentName: john.name,
      rollNo: john.rollNo,
      title: 'Water supply issue in Block B',
      description: 'There has been no water in Block B hostel for 3 days. Students are really struggling with basic needs. Please fix this urgently.',
      category: 'Hostel',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Hostel Office',
      adminResponse: 'We have assigned this to the hostel office team.',
      departmentRemarks: 'Plumber checked the pipeline, repair work is ongoing.'
    },
    {
      student: john._id,
      studentName: john.name,
      rollNo: john.rollNo,
      title: 'Book not found in library',
      description: 'Introduction to Algorithms by Cormen is showing available in the catalog but its not on the shelf. I need it for my exams next week.',
      category: 'Library',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      student: priya._id,
      studentName: priya.name,
      rollNo: priya.rollNo,
      title: 'Swimming pool closed without notice',
      description: 'The pool has been closed for a week with no announcement. Students who paid for swimming sessions are affected and need either a refund or rescheduling.',
      category: 'Sports Complex',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Sports Department',
      adminResponse: 'Issue forwarded to sports department.',
      departmentRemarks: 'Maintenance done. Pool is now open.',
      resolvedAt: new Date()
    },
    {
      student: priya._id,
      studentName: priya.name,
      rollNo: priya.rollNo,
      title: 'Professor not attending classes',
      description: 'Prof. Verma has missed 4 lectures in a row without informing students. Exams are coming and the syllabus is not complete.',
      category: 'Faculty',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Faculty Coordination',
      adminResponse: 'Escalated to faculty coordination department.'
    }
  ]);

  console.log('Seeder done');
};

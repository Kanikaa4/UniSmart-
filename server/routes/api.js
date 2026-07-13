const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const auth = require('../controllers/authController');
const admin = require('../controllers/adminController');
const faculty = require('../controllers/facultyController');
const chatbot = require('../controllers/chatbotController');

const router = express.Router();

// Configure Multer memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication Routes
router.post('/auth/send-otp', auth.sendOtp);
router.post('/auth/verify-otp', auth.verifyOtp);

// Chatbot Route (supports optional auth inside controller)
router.post('/chatbot/message', chatbot.handleMessage);

// Super Admin Protected Routes
router.post('/admin/faculty', verifyToken, requireRole('admin'), admin.createFaculty);
router.get('/admin/faculty', verifyToken, requireRole('admin'), admin.getFacultyList);
router.post('/admin/upload-students', verifyToken, requireRole('admin'), upload.single('file'), admin.uploadStudentCsv);

// Faculty Protected Routes
router.get('/faculty/students', verifyToken, requireRole('faculty'), faculty.getStudents);
router.get('/faculty/attendance', verifyToken, requireRole('faculty'), faculty.getAttendanceLogs);
router.post('/faculty/attendance', verifyToken, requireRole('faculty'), faculty.logAttendance);
router.get('/faculty/ai-insights', verifyToken, requireRole('faculty'), faculty.getAiInsights);
router.get('/faculty/marks', verifyToken, requireRole('faculty'), faculty.getMarks);
router.post('/faculty/marks', verifyToken, requireRole('faculty'), faculty.logMarks);

module.exports = router;

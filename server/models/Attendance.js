const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['P', 'A'], required: true }
});

const AttendanceSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    date: { type: String, required: true }, // Store as YYYY-MM-DD
    records: [AttendanceRecordSchema],
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one log per date per faculty
AttendanceSchema.index({ facultyId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

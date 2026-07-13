const { getDbMode } = require('../config/db');
const mockStore = require('../config/mockStore');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

const getStudents = async (req, res) => {
    const facultyId = req.user.id;

    try {
        const isMock = getDbMode();
        let students = [];

        if (isMock) {
            students = mockStore.studentList.filter(s => s.facultyAssigned === facultyId);
        } else {
            students = await Student.find({ facultyAssigned: facultyId });
        }

        // Calculate dynamic attendance percentage for each student
        const enrichedStudents = await Promise.all(students.map(async (student) => {
            const stats = await getStudentAttendanceStats(student._id.toString(), facultyId, isMock);
            return {
                _id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                batch: student.batch,
                attendance: stats.percentage,
                totalSessions: stats.total,
                attendedSessions: stats.attended
            };
        }));

        return res.status(200).json({ success: true, students: enrichedStudents });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve students roster.' });
    }
};

const getAttendanceLogs = async (req, res) => {
    const facultyId = req.user.id;

    try {
        const isMock = getDbMode();
        let logs = [];

        if (isMock) {
            logs = mockStore.attendanceLogs.filter(log => log.facultyId === facultyId);
        } else {
            logs = await Attendance.find({ facultyId });
        }

        // Transform logs into an easier format YYYY-MM-DD -> { studentRoll: P/A }
        const logsMap = {};
        logs.forEach(log => {
            const recordsMap = {};
            log.records.forEach(rec => {
                recordsMap[rec.studentId.toString()] = rec.status;
            });
            logsMap[log.date] = recordsMap;
        });

        return res.status(200).json({ success: true, logs: logsMap });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve attendance logs.' });
    }
};

const logAttendance = async (req, res) => {
    const facultyId = req.user.id;
    const { date, records } = req.body; // records: [{ studentId, status: 'P'|'A' }]

    if (!date || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Date and records array are required.' });
    }

    try {
        const isMock = getDbMode();

        if (isMock) {
            const existingLogIdx = mockStore.attendanceLogs.findIndex(log => log.facultyId === facultyId && log.date === date);
            const formattedRecords = records.map(r => ({ studentId: r.studentId, status: r.status }));

            if (existingLogIdx > -1) {
                mockStore.attendanceLogs[existingLogIdx].records = formattedRecords;
            } else {
                mockStore.attendanceLogs.push({
                    _id: 'att_' + (mockStore.attendanceLogs.length + 1),
                    facultyId,
                    date,
                    records: formattedRecords
                });
            }
        } else {
            const formattedRecords = records.map(r => ({ studentId: r.studentId, status: r.status }));
            
            await Attendance.findOneAndUpdate(
                { facultyId, date },
                { records: formattedRecords },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({ success: true, message: 'Attendance records updated successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to record attendance logs.' });
    }
};

const getAiInsights = async (req, res) => {
    const facultyId = req.user.id;

    try {
        const isMock = getDbMode();
        let students = [];

        if (isMock) {
            students = mockStore.studentList.filter(s => s.facultyAssigned === facultyId);
        } else {
            students = await Student.find({ facultyAssigned: facultyId });
        }

        const atRiskStudents = [];
        let totalSum = 0;
        let counted = 0;

        for (const student of students) {
            const stats = await getStudentAttendanceStats(student._id.toString(), facultyId, isMock);
            totalSum += stats.percentage;
            counted++;

            if (stats.percentage < 85) {
                // Calculate drop probability
                const baseProb = 100 - (stats.percentage * 1.1);
                const dropProbability = Math.max(10, Math.round(baseProb + Math.random() * 8));
                
                let triggerCause = 'Irregular attendance';
                let recommendation = 'Schedule check-in email alert.';
                if (stats.percentage < 70) {
                    triggerCause = 'Absenteeism exceeding 30% limit';
                    recommendation = 'Schedule 1-on-1 advisor review. Alert registrar.';
                } else if (stats.percentage < 78) {
                    triggerCause = 'Consecutive missing records in core tutorials';
                    recommendation = 'Assign makeup quiz to recover participation credit.';
                }

                atRiskStudents.push({
                    _id: student._id,
                    name: student.name,
                    rollNumber: student.rollNumber,
                    attendance: stats.percentage,
                    dropProbability,
                    triggerCause,
                    recommendation
                });
            }
        }

        // Sort by highest risk first
        atRiskStudents.sort((a, b) => b.dropProbability - a.dropProbability);

        const currentAvg = counted > 0 ? Math.round(totalSum / counted) : 80;

        // Mock a 7 day projection trend (last 6 days + today + forecast)
        const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today', 'AI Forecast'];
        const actualTrend = [
            currentAvg - 3,
            currentAvg - 1,
            currentAvg - 2,
            currentAvg,
            currentAvg - 1,
            currentAvg,
            currentAvg,
            null
        ];
        const forecastTrend = [null, null, null, null, null, null, currentAvg, Math.min(100, currentAvg + 3)];

        return res.status(200).json({
            success: true,
            forecast: {
                labels,
                actualTrend,
                forecastTrend
            },
            atRiskStudents
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'AI Insights engine failed.' });
    }
};

// Helper: Calculate attendance rates
const getStudentAttendanceStats = async (studentId, facultyId, isMock) => {
    let logs = [];
    if (isMock) {
        logs = mockStore.attendanceLogs.filter(log => log.facultyId === facultyId);
    } else {
        logs = await Attendance.find({ facultyId });
    }

    let total = 0;
    let attended = 0;

    logs.forEach(log => {
        const record = log.records.find(r => r.studentId.toString() === studentId);
        if (record) {
            total++;
            if (record.status === 'P') attended++;
        }
    });

    return {
        total,
        attended,
        percentage: total > 0 ? Math.round((attended / total) * 100) : 100 // Default to 100 if no classes logged
    };
};

const getMarks = async (req, res) => {
    const facultyId = req.user.id;
    try {
        const isMock = getDbMode();
        let marks = [];
        if (isMock) {
            marks = mockStore.marksList.filter(m => m.facultyId === facultyId);
        } else {
            marks = await Marks.find({ facultyId });
        }
        return res.status(200).json({ success: true, marks });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve marks.' });
    }
};

const logMarks = async (req, res) => {
    const facultyId = req.user.id;
    const { subject, records } = req.body; // records: [{ studentId, marks, maxMarks }]

    if (!subject || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Subject and records array are required.' });
    }

    try {
        const isMock = getDbMode();

        if (isMock) {
            // Save to mockStore
            records.forEach(rec => {
                const existingIdx = mockStore.marksList.findIndex(
                    m => m.studentId === rec.studentId && 
                         m.facultyId === facultyId && 
                         m.subject === subject
                );

                if (existingIdx > -1) {
                    mockStore.marksList[existingIdx].marks = Number(rec.marks);
                    mockStore.marksList[existingIdx].maxMarks = Number(rec.maxMarks || 100);
                } else {
                    mockStore.marksList.push({
                        _id: 'marks_' + (mockStore.marksList.length + 1),
                        studentId: rec.studentId,
                        facultyId,
                        subject,
                        marks: Number(rec.marks),
                        maxMarks: Number(rec.maxMarks || 100),
                        createdAt: new Date()
                    });
                }
            });
        } else {
            // Save to MongoDB
            for (const rec of records) {
                await Marks.findOneAndUpdate(
                    { studentId: rec.studentId, facultyId, subject },
                    { 
                        marks: Number(rec.marks), 
                        maxMarks: Number(rec.maxMarks || 100) 
                    },
                    { upsert: true, new: true }
                );
            }
        }

        return res.status(200).json({ success: true, message: 'Marks updated successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to record marks.' });
    }
};

module.exports = { getStudents, getAttendanceLogs, logAttendance, getAiInsights, getMarks, logMarks };


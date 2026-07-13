const { getDbMode } = require('../config/db');
const mockStore = require('../config/mockStore');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// Custom lightweight CSV parser
const parseCsvBuffer = (buffer) => {
    const text = buffer.toString('utf-8');
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    // Header parsing
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const rowData = {};
        headers.forEach((header, idx) => {
            rowData[header] = values[idx] || '';
        });
        rows.push(rowData);
    }
    return rows;
};

const createFaculty = async (req, res) => {
    const { name, email, department, academicYear, subjects } = req.body;

    if (!name || !email || !department || !academicYear) {
        return res.status(400).json({ error: 'All fields (name, email, department, academicYear) are required.' });
    }

    // Parse subjects
    let parsedSubjects = [];
    if (subjects) {
        if (Array.isArray(subjects)) {
            parsedSubjects = subjects;
        } else if (typeof subjects === 'string') {
            parsedSubjects = subjects.split(',').map(s => s.trim()).filter(s => s !== '');
        }
    }

    try {
        const isMock = getDbMode();

        if (isMock) {
            // Check uniqueness in mock list
            if (mockStore.facultyList.some(f => f.email === email)) {
                return res.status(400).json({ error: 'Faculty profile already exists with this email.' });
            }
            
            const newFaculty = {
                _id: 'fac_' + (mockStore.facultyList.length + 1),
                name,
                email,
                department,
                academicYear,
                status: 'Active',
                subjects: parsedSubjects
            };
            mockStore.facultyList.push(newFaculty);
            return res.status(201).json({ success: true, faculty: newFaculty });
        } else {
            const exists = await Faculty.findOne({ email });
            if (exists) {
                return res.status(400).json({ error: 'Faculty profile already exists with this email.' });
            }
            
            const faculty = new Faculty({ name, email, department, academicYear, subjects: parsedSubjects });
            await faculty.save();
            return res.status(201).json({ success: true, faculty });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create faculty profile.' });
    }
};

const getFacultyList = async (req, res) => {
    try {
        const isMock = getDbMode();
        if (isMock) {
            return res.status(200).json({ success: true, faculty: mockStore.facultyList });
        } else {
            const faculty = await Faculty.find({});
            return res.status(200).json({ success: true, faculty });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve faculty roster.' });
    }
};

const uploadStudentCsv = async (req, res) => {
    const { facultyId } = req.body;

    if (!facultyId) {
        return res.status(400).json({ error: 'Assigned Faculty ID parameter is required.' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV roster file.' });
    }

    try {
        const isMock = getDbMode();
        const parsedRows = parseCsvBuffer(req.file.buffer);

        // Required headers validation
        const requiredHeaders = ['Name', 'RollNumber', 'Email', 'Batch'];
        const firstRow = parsedRows[0] || {};
        const headersValid = requiredHeaders.every(header => Object.keys(firstRow).includes(header));
        
        if (!headersValid) {
            return res.status(400).json({ error: 'Invalid CSV format. Missing required headers: Name, RollNumber, Email, Batch' });
        }

        let addedCount = 0;

        if (isMock) {
            parsedRows.forEach(row => {
                const exists = mockStore.studentList.some(s => s.rollNumber === row.RollNumber);
                if (!exists) {
                    mockStore.studentList.push({
                        _id: 'stud_' + (mockStore.studentList.length + 1),
                        name: row.Name,
                        rollNumber: row.RollNumber,
                        email: row.Email,
                        batch: row.Batch,
                        facultyAssigned: facultyId
                    });
                    addedCount++;
                }
            });
        } else {
            // Bulk insert mapped array
            for (const row of parsedRows) {
                const exists = await Student.findOne({ rollNumber: row.RollNumber });
                if (!exists) {
                    const student = new Student({
                        name: row.Name,
                        rollNumber: row.RollNumber,
                        email: row.Email,
                        batch: row.Batch,
                        facultyAssigned: facultyId
                    });
                    await student.save();
                    addedCount++;
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: `File processed successfully. Added ${addedCount} new student records to database.`
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to process student roster file.' });
    }
};

module.exports = { createFaculty, getFacultyList, uploadStudentCsv };

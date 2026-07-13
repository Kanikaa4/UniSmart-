// Mock database store for fallback mode

const mockStore = {
    facultyList: [
        { _id: 'fac_1', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@unismart.edu', department: 'Computer Science', academicYear: '2023-2024', status: 'Active', subjects: ['Advanced Algorithms', 'Machine Learning', 'Web Development'] },
        { _id: 'fac_2', name: 'Dr. Alan Turing', email: 'alan.turing@unismart.edu', department: 'Mathematics', academicYear: '2023-2024', status: 'Active', subjects: ['Mathematics', 'Linear Algebra', 'Probability & Statistics'] }
    ],
    
    studentList: [
        { _id: 'stud_1', name: 'Alice Smith', rollNumber: 'CS-2026-001', email: 'alice.smith@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_2', name: 'Bob Jones', rollNumber: 'CS-2026-002', email: 'bob.jones@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_3', name: 'Charlie Brown', rollNumber: 'CS-2026-003', email: 'charlie.brown@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_4', name: 'Diana Prince', rollNumber: 'CS-2026-004', email: 'diana.prince@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_5', name: 'Ethan Hunt', rollNumber: 'CS-2026-005', email: 'ethan.hunt@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' }
    ],
    
    attendanceLogs: [
        {
            _id: 'att_1',
            facultyId: 'fac_1',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_1', status: 'P' },
                { studentId: 'stud_2', status: 'P' },
                { studentId: 'stud_3', status: 'P' },
                { studentId: 'stud_4', status: 'A' },
                { studentId: 'stud_5', status: 'P' }
            ]
        },
        {
            _id: 'att_2',
            facultyId: 'fac_1',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_1', status: 'P' },
                { studentId: 'stud_2', status: 'A' },
                { studentId: 'stud_3', status: 'P' },
                { studentId: 'stud_4', status: 'A' },
                { studentId: 'stud_5', status: 'P' }
            ]
        }
    ],
    
    marksList: [],
    
    otps: {} // keyed by email -> { otp: '...', expiresAt: Date }
};

module.exports = mockStore;

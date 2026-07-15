// Mock database store for fallback mode

const mockStore = {
    facultyList: [
        { _id: 'fac_1', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@unismart.edu', department: 'Computer Science', academicYear: '2023-2024', status: 'Active', subjects: ['Advanced Algorithms', 'Machine Learning', 'Web Development'] },
        { _id: 'fac_2', name: 'Dr. Alan Turing', email: 'alan.turing@unismart.edu', department: 'Mathematics', academicYear: '2023-2024', status: 'Active', subjects: ['Mathematics', 'Linear Algebra', 'Probability & Statistics'] },
        { _id: 'fac_3', name: 'Prof. Grace Hopper', email: 'grace.hopper@unismart.edu', department: 'Computer Science', academicYear: '2023-2024', status: 'Active', subjects: ['Compiler Design', 'Operating Systems', 'COBOL Programming'] },
        { _id: 'fac_4', name: 'Dr. Richard Feynman', email: 'richard.feynman@unismart.edu', department: 'Physics', academicYear: '2023-2024', status: 'Active', subjects: ['Quantum Mechanics', 'Electromagnetism', 'Statistical Physics'] },
        { _id: 'fac_5', name: 'Dr. Katherine Johnson', email: 'katherine.j@unismart.edu', department: 'Mathematics', academicYear: '2023-2024', status: 'Active', subjects: ['Calculus', 'Celestial Mechanics', 'Differential Equations'] }
    ],
    
    studentList: [
        { _id: 'stud_1', name: 'Alice Smith', rollNumber: 'CS-2026-001', email: 'alice.smith@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_2', name: 'Bob Jones', rollNumber: 'CS-2026-002', email: 'bob.jones@unismart.edu', batch: '2026', facultyAssigned: 'fac_1' },
        { _id: 'stud_3', name: 'Charlie Brown', rollNumber: 'CS-2026-003', email: 'charlie.brown@unismart.edu', batch: '2026', facultyAssigned: 'fac_2' },
        { _id: 'stud_4', name: 'Diana Prince', rollNumber: 'CS-2026-004', email: 'diana.prince@unismart.edu', batch: '2026', facultyAssigned: 'fac_2' },
        { _id: 'stud_5', name: 'Ethan Hunt', rollNumber: 'CS-2026-005', email: 'ethan.hunt@unismart.edu', batch: '2026', facultyAssigned: 'fac_3' },
        { _id: 'stud_6', name: 'Fiona Gallagher', rollNumber: 'CS-2026-006', email: 'fiona.gallagher@unismart.edu', batch: '2026', facultyAssigned: 'fac_3' },
        { _id: 'stud_7', name: 'George Clark', rollNumber: 'CS-2026-007', email: 'george.clark@unismart.edu', batch: '2026', facultyAssigned: 'fac_4' },
        { _id: 'stud_8', name: 'Hannah Abbott', rollNumber: 'CS-2026-008', email: 'hannah.abbott@unismart.edu', batch: '2026', facultyAssigned: 'fac_4' },
        { _id: 'stud_9', name: 'Ian Malcolm', rollNumber: 'CS-2026-009', email: 'ian.malcolm@unismart.edu', batch: '2026', facultyAssigned: 'fac_5' },
        { _id: 'stud_10', name: 'Julia Roberts', rollNumber: 'CS-2026-010', email: 'julia.roberts@unismart.edu', batch: '2026', facultyAssigned: 'fac_5' }
    ],
    
    attendanceLogs: [
        // Dr. Sarah Jenkins (fac_1)
        {
            _id: 'att_1_1',
            facultyId: 'fac_1',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_1', status: 'P' },
                { studentId: 'stud_2', status: 'P' }
            ]
        },
        {
            _id: 'att_1_2',
            facultyId: 'fac_1',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_1', status: 'P' },
                { studentId: 'stud_2', status: 'A' }
            ]
        },
        // Dr. Alan Turing (fac_2)
        {
            _id: 'att_2_1',
            facultyId: 'fac_2',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_3', status: 'P' },
                { studentId: 'stud_4', status: 'A' }
            ]
        },
        {
            _id: 'att_2_2',
            facultyId: 'fac_2',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_3', status: 'P' },
                { studentId: 'stud_4', status: 'P' }
            ]
        },
        // Prof. Grace Hopper (fac_3)
        {
            _id: 'att_3_1',
            facultyId: 'fac_3',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_5', status: 'P' },
                { studentId: 'stud_6', status: 'P' }
            ]
        },
        {
            _id: 'att_3_2',
            facultyId: 'fac_3',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_5', status: 'A' },
                { studentId: 'stud_6', status: 'P' }
            ]
        },
        // Dr. Richard Feynman (fac_4)
        {
            _id: 'att_4_1',
            facultyId: 'fac_4',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_7', status: 'A' },
                { studentId: 'stud_8', status: 'P' }
            ]
        },
        {
            _id: 'att_4_2',
            facultyId: 'fac_4',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_7', status: 'A' },
                { studentId: 'stud_8', status: 'P' }
            ]
        },
        // Dr. Katherine Johnson (fac_5)
        {
            _id: 'att_5_1',
            facultyId: 'fac_5',
            date: '2026-07-08',
            records: [
                { studentId: 'stud_9', status: 'P' },
                { studentId: 'stud_10', status: 'P' }
            ]
        },
        {
            _id: 'att_5_2',
            facultyId: 'fac_5',
            date: '2026-07-09',
            records: [
                { studentId: 'stud_9', status: 'P' },
                { studentId: 'stud_10', status: 'A' }
            ]
        }
    ],
    
    marksList: [],
    
    otps: {} // keyed by email -> { otp: '...', expiresAt: Date }
};

module.exports = mockStore;

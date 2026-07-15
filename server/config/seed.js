const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const seedDatabase = async () => {
    try {
        const facultyCount = await Faculty.countDocuments();
        if (facultyCount > 0) {
            console.log('Database already seeded. Skipping initialization.');
            return;
        }

        console.log('Seeding initial database records...');

        // 1. Create Faculty profiles
        const facultiesData = [
            { name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@unismart.edu', department: 'Computer Science', academicYear: '2023-2024', status: 'Active', subjects: ['Advanced Algorithms', 'Machine Learning', 'Web Development'] },
            { name: 'Dr. Alan Turing', email: 'alan.turing@unismart.edu', department: 'Mathematics', academicYear: '2023-2024', status: 'Active', subjects: ['Mathematics', 'Linear Algebra', 'Probability & Statistics'] },
            { name: 'Prof. Grace Hopper', email: 'grace.hopper@unismart.edu', department: 'Computer Science', academicYear: '2023-2024', status: 'Active', subjects: ['Compiler Design', 'Operating Systems', 'COBOL Programming'] },
            { name: 'Dr. Richard Feynman', email: 'richard.feynman@unismart.edu', department: 'Physics', academicYear: '2023-2024', status: 'Active', subjects: ['Quantum Mechanics', 'Electromagnetism', 'Statistical Physics'] },
            { name: 'Dr. Katherine Johnson', email: 'katherine.j@unismart.edu', department: 'Mathematics', academicYear: '2023-2024', status: 'Active', subjects: ['Calculus', 'Celestial Mechanics', 'Differential Equations'] }
        ];

        const insertedFaculties = await Faculty.insertMany(facultiesData);
        console.log(`Seeded ${insertedFaculties.length} faculty profiles.`);

        // Find the seeded faculty objects to map their ObjectIds
        const facSarah = insertedFaculties.find(f => f.email === 'sarah.jenkins@unismart.edu');
        const facAlan = insertedFaculties.find(f => f.email === 'alan.turing@unismart.edu');
        const facGrace = insertedFaculties.find(f => f.email === 'grace.hopper@unismart.edu');
        const facRichard = insertedFaculties.find(f => f.email === 'richard.feynman@unismart.edu');
        const facKatherine = insertedFaculties.find(f => f.email === 'katherine.j@unismart.edu');

        // 2. Create Students
        const studentsData = [
            { name: 'Alice Smith', rollNumber: 'CS-2026-001', email: 'alice.smith@unismart.edu', batch: '2026', facultyAssigned: facSarah._id },
            { name: 'Bob Jones', rollNumber: 'CS-2026-002', email: 'bob.jones@unismart.edu', batch: '2026', facultyAssigned: facSarah._id },
            { name: 'Charlie Brown', rollNumber: 'CS-2026-003', email: 'charlie.brown@unismart.edu', batch: '2026', facultyAssigned: facAlan._id },
            { name: 'Diana Prince', rollNumber: 'CS-2026-004', email: 'diana.prince@unismart.edu', batch: '2026', facultyAssigned: facAlan._id },
            { name: 'Ethan Hunt', rollNumber: 'CS-2026-005', email: 'ethan.hunt@unismart.edu', batch: '2026', facultyAssigned: facGrace._id },
            { name: 'Fiona Gallagher', rollNumber: 'CS-2026-006', email: 'fiona.gallagher@unismart.edu', batch: '2026', facultyAssigned: facGrace._id },
            { name: 'George Clark', rollNumber: 'CS-2026-007', email: 'george.clark@unismart.edu', batch: '2026', facultyAssigned: facRichard._id },
            { name: 'Hannah Abbott', rollNumber: 'CS-2026-008', email: 'hannah.abbott@unismart.edu', batch: '2026', facultyAssigned: facRichard._id },
            { name: 'Ian Malcolm', rollNumber: 'CS-2026-009', email: 'ian.malcolm@unismart.edu', batch: '2026', facultyAssigned: facKatherine._id },
            { name: 'Julia Roberts', rollNumber: 'CS-2026-010', email: 'julia.roberts@unismart.edu', batch: '2026', facultyAssigned: facKatherine._id }
        ];

        const insertedStudents = await Student.insertMany(studentsData);
        console.log(`Seeded ${insertedStudents.length} student records.`);

        // Map student IDs
        const stud1 = insertedStudents.find(s => s.rollNumber === 'CS-2026-001');
        const stud2 = insertedStudents.find(s => s.rollNumber === 'CS-2026-002');
        const stud3 = insertedStudents.find(s => s.rollNumber === 'CS-2026-003');
        const stud4 = insertedStudents.find(s => s.rollNumber === 'CS-2026-004');
        const stud5 = insertedStudents.find(s => s.rollNumber === 'CS-2026-005');
        const stud6 = insertedStudents.find(s => s.rollNumber === 'CS-2026-006');
        const stud7 = insertedStudents.find(s => s.rollNumber === 'CS-2026-007');
        const stud8 = insertedStudents.find(s => s.rollNumber === 'CS-2026-008');
        const stud9 = insertedStudents.find(s => s.rollNumber === 'CS-2026-009');
        const stud10 = insertedStudents.find(s => s.rollNumber === 'CS-2026-010');

        // 3. Create Attendance Logs
        const attendanceLogsData = [
            // Dr. Sarah Jenkins
            { facultyId: facSarah._id, date: '2026-07-08', records: [{ studentId: stud1._id, status: 'P' }, { studentId: stud2._id, status: 'P' }] },
            { facultyId: facSarah._id, date: '2026-07-09', records: [{ studentId: stud1._id, status: 'P' }, { studentId: stud2._id, status: 'A' }] },
            // Dr. Alan Turing
            { facultyId: facAlan._id, date: '2026-07-08', records: [{ studentId: stud3._id, status: 'P' }, { studentId: stud4._id, status: 'A' }] },
            { facultyId: facAlan._id, date: '2026-07-09', records: [{ studentId: stud3._id, status: 'P' }, { studentId: stud4._id, status: 'P' }] },
            // Prof. Grace Hopper
            { facultyId: facGrace._id, date: '2026-07-08', records: [{ studentId: stud5._id, status: 'P' }, { studentId: stud6._id, status: 'P' }] },
            { facultyId: facGrace._id, date: '2026-07-09', records: [{ studentId: stud5._id, status: 'A' }, { studentId: stud6._id, status: 'P' }] },
            // Dr. Richard Feynman
            { facultyId: facRichard._id, date: '2026-07-08', records: [{ studentId: stud7._id, status: 'A' }, { studentId: stud8._id, status: 'P' }] },
            { facultyId: facRichard._id, date: '2026-07-09', records: [{ studentId: stud7._id, status: 'A' }, { studentId: stud8._id, status: 'P' }] },
            // Dr. Katherine Johnson
            { facultyId: facKatherine._id, date: '2026-07-08', records: [{ studentId: stud9._id, status: 'P' }, { studentId: stud10._id, status: 'P' }] },
            { facultyId: facKatherine._id, date: '2026-07-09', records: [{ studentId: stud9._id, status: 'P' }, { studentId: stud10._id, status: 'A' }] }
        ];

        await Attendance.insertMany(attendanceLogsData);
        console.log('Seeded initial attendance logs.');

    } catch (err) {
        console.error('Error seeding database:', err.message);
    }
};

module.exports = { seedDatabase };

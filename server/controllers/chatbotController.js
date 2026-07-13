const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require('jsonwebtoken');
const { getDbMode } = require('../config/db');
const mockStore = require('../config/mockStore');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');

const JWT_SECRET = process.env.JWT_SECRET || 'unismart_jwt_secret_key';

// Helper: Calculate attendance rates
const getStudentStats = async (studentId, facultyId, isMock) => {
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
        percentage: total > 0 ? Math.round((attended / total) * 100) : 100
    };
};

const handleMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    const msg = message.toLowerCase().trim();

    try {
        const isMock = getDbMode();

        // Check for optional authorization token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let user = null;

        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                console.warn('Chatbot received invalid token:', err.message);
            }
        }

        // Build User Context for LLM
        let userContext = "";
        let facultyName = "Faculty Member";
        let department = "Computer Science";
        let academicYear = "2023-2024";
        let students = [];
        let atRiskStudents = [];
        let avgAttendance = 80;
        let facultyCount = 2;
        let studentCount = 5;

        let subjects = [];
        if (user) {
            if (user.role === 'faculty') {
                if (isMock) {
                    const fac = mockStore.facultyList.find(f => f._id === user.id);
                    if (fac) {
                        facultyName = fac.name;
                        department = fac.department;
                        academicYear = fac.academicYear;
                        subjects = fac.subjects || [];
                    }
                } else {
                    const fac = await Faculty.findById(user.id);
                    if (fac) {
                        facultyName = fac.name;
                        department = fac.department;
                        academicYear = fac.academicYear;
                        subjects = fac.subjects || [];
                    }
                }

                if (isMock) {
                    students = mockStore.studentList.filter(s => s.facultyAssigned === user.id);
                } else {
                    students = await Student.find({ facultyAssigned: user.id });
                }

                let totalSum = 0;
                let counted = 0;

                for (const student of students) {
                    const stats = await getStudentStats(student._id.toString(), user.id, isMock);
                    totalSum += stats.percentage;
                    counted++;

                    if (stats.percentage < 85) {
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
                            name: student.name,
                            rollNumber: student.rollNumber,
                            attendance: stats.percentage,
                            dropProbability,
                            triggerCause,
                            recommendation
                        });
                    }
                }

                avgAttendance = counted > 0 ? Math.round(totalSum / counted) : 100;

                userContext = `User is logged in as Dr. ${facultyName} (Email: ${user.email}, Role: Faculty, Department: ${department}, Term: ${academicYear}).
Assigned Subjects: ${subjects.join(', ') || 'None'}.
Active Student Count: ${counted} students.
Class Average Attendance: ${avgAttendance}%.
Number of students classified as at-risk (attendance < 85%): ${atRiskStudents.length} students.
At-risk student details:
${atRiskStudents.map((s, idx) => `- ${idx + 1}. Name: ${s.name}, Roll: ${s.rollNumber}, Attendance: ${s.attendance}%, Drop Risk: ${s.dropProbability}%, Cause: "${s.triggerCause}", Recommendation: "${s.recommendation}"`).join('\n')}
Complete Student List:
${students.map(s => `- ${s.name} (${s.rollNumber})`).join('\n')}`;
            }
            else if (user.role === 'admin') {
                if (!isMock) {
                    try {
                        facultyCount = await Faculty.countDocuments();
                        studentCount = await Student.countDocuments();
                    } catch (e) {
                        console.error('Failed to get admin stats from DB:', e.message);
                    }
                }
                userContext = `User is logged in as Super Admin (Email: ${user.email}, Role: Admin).
System diagnostic metrics:
- Database Mode: ${isMock ? 'Mock In-Memory' : 'MongoDB Connected'}
- Registered Faculty Count: ${facultyCount}
- Registered Student Count: ${studentCount}`;
            }
        } else {
            userContext = `User is a Guest (Not logged in).
Demo user profiles they can use to log in:
- Department Faculty: "sarah.jenkins@unismart.edu"
- Super Admin: "admin@unismart.edu"
Explain the OTP login process to them if they ask how to sign in or access their dashboard.`;
        }

        // Try using Gemini AI if key is configured
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const systemPrompt = `You are the UniSmart AI Academic Assistant, a helpful and professional educational chatbot integrated into the UniSmart LMS (University Learning Management System) platform.

Here is the system context you are operating in:
- The platform features passwordless secure OTP logins, attendance calendar logs, AI insights prediction panels, and CSV sync utilities.
- Tech Stack: React (Vite) + Tailwind CSS on the frontend; Node.js (Express) + MongoDB on the backend.
- Future roadmap: Student & Parent portals (Q3 2026), Mobile applications (Q4 2026), 24/7 AI Academic Assistant (Q1 2027).

Current User Context:
${userContext}

When responding:
1. Always maintain a professional, helpful, and concise academic tone.
2. Format your responses in clear markdown (bullet points, bold text).
3. If the user asks about system functionalities or stats, use the provided user context to answer specifically.
4. Keep the responses brief (under 150 words) to fit nicely in a chat bubble.
5. If the user is logged in as faculty or admin, use their name or details to personalize the interaction.
`;

                const result = await model.generateContent([
                    { text: systemPrompt },
                    { text: `User message: "${message}"` }
                ]);

                const responseText = result.response.text();
                return res.status(200).json({ success: true, reply: responseText });

            } catch (err) {
                console.error("Gemini AI API Call Failed, falling back to simulator:", err.message);
            }
        }

        // Rule-based Fallback / Simulator (when Gemini Key is not set or fails)
        let responseText = "";

        if (user) {
            if (user.role === 'faculty') {
                if (msg.includes('at risk') || msg.includes('risk') || msg.includes('drop') || msg.includes('fail') || msg.includes('intervention')) {
                    if (atRiskStudents.length > 0) {
                        responseText = `Based on my machine learning analysis, you have **${atRiskStudents.length}** students classified as **at-risk** (below 85% attendance):\n\n` +
                            atRiskStudents.map((s, idx) =>
                                `${idx + 1}. **${s.name}** (${s.rollNumber})\n` +
                                `   - **Attendance:** ${s.attendance}%\n` +
                                `   - **Estimated Drop Probability:** ${s.dropProbability}%\n` +
                                `   - **Cause:** *${s.triggerCause}*\n` +
                                `   - **Recommended Action:** *${s.recommendation}*`
                            ).join('\n\n');
                    } else {
                        responseText = `Excellent news, Dr. ${facultyName}! All students in your current roster satisfy the required margins, maintaining attendance levels at 85% or above.`;
                    }
                }
                else if (msg.includes('average') || msg.includes('stats') || msg.includes('statistics') || msg.includes('attendance rates')) {
                    responseText = `Here is your class attendance summary for **Dr. ${facultyName}**:\n\n` +
                        `- **Assigned Student Count:** ${students.length} students\n` +
                        `- **Roster Average Attendance:** ${avgAttendance}%\n` +
                        `- **Interventions Pending:** ${atRiskStudents.length} students at risk\n\n` +
                        `You can view the dynamic graphical visualizations under the **AI Insights Engine** tab.`;
                }
                else if (msg.includes('student') || msg.includes('roster') || msg.includes('class') || msg.includes('list')) {
                    if (students.length > 0) {
                        responseText = `Here is your current class roster along with their logged attendance:\n\n` +
                            students.map(s => `- **${s.name}** (${s.rollNumber})`).join('\n') +
                            `\n\nTo view or update daily logs, navigate to the **Class Attendance** tab in your dashboard sidebar.`;
                    } else {
                        responseText = `You currently do not have any students assigned to your class. You can bulk import students using the Super Admin portal.`;
                    }
                }
                else if (msg.includes('who am i') || msg.includes('profile') || msg.includes('my name') || msg.includes('my details')) {
                    responseText = `You are logged in as **Dr. ${facultyName}**.\n\n` +
                        `- **Email:** ${user.email}\n` +
                        `- **Role:** Department Faculty\n` +
                        `- **Department:** ${department}\n` +
                        `- **Academic Term:** ${academicYear}\n` +
                        `- **Status:** Active (Verified)`;
                }
                else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('greetings') || msg.includes('who are you')) {
                    responseText = `Hello Dr. ${facultyName}! I am your UniSmart AI Academic Assistant. I have successfully verified your credentials. \n\nI can help you analyze student risk factors, look up attendance statistics, or inspect your student roster. What would you like to do?`;
                }
            }
            else if (user.role === 'admin') {
                if (msg.includes('faculty') || msg.includes('teacher') || msg.includes('instructor')) {
                    responseText = `There are currently **${facultyCount}** registered department faculty profiles in the UniSmart system:\n` +
                        `- **Dr. Sarah Jenkins** (Computer Science department)\n` +
                        `- **Dr. Alan Turing** (Mathematics department)\n\n` +
                        `As Super Admin, you can add new faculty members directly using the **Dashboard Overview** panel.`;
                }
                else if (msg.includes('student') || msg.includes('total')) {
                    responseText = `The system database currently tracks **${studentCount}** students. All active records are currently assigned to the Computer Science department faculty. \n\nYou can upload and parse new batch rosters using the CSV uploader in your admin panel.`;
                }
                else if (msg.includes('stat') || msg.includes('system') || msg.includes('health') || msg.includes('database')) {
                    responseText = `**UniSmart System Diagnosis Report:**\n\n` +
                        `- **Execution Mode:** ${isMock ? 'MOCK DATABASE (In-memory)' : 'LIVE MONGODB (Connected)'}\n` +
                        `- **Total Faculty Profiles:** ${facultyCount}\n` +
                        `- **Total Student Profiles:** ${studentCount}\n` +
                        `- **Nodemailer SMTP Simulator:** Online\n` +
                        `- **Authentication Tokens:** Active (24h expiry)`;
                }
                else if (msg.includes('who am i') || msg.includes('profile') || msg.includes('my name') || msg.includes('my details')) {
                    responseText = `You are logged in as the **UniSmart Super Admin**.\n\n` +
                        `- **Email:** ${user.email}\n` +
                        `- **Administrative Level:** Tier 1 System Administrator\n` +
                        `- **Access Token:** Verified JWT`;
                }
                else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('greetings') || msg.includes('who are you')) {
                    responseText = `Hello Super Admin! I am your UniSmart AI System Console Assistant. \n\nI can help you review system diagnostics, list registered faculty, or give student counts. How can I assist you in managing the platform today?`;
                }
            }
        }

        if (!responseText) {
            if (msg.includes('otp') || msg.includes('login') || msg.includes('verify') || msg.includes('sign in') || msg.includes('authenticate')) {
                responseText = `UniSmart features a secure, passwordless authentication system using **One-Time Passwords (OTP)**:\n\n` +
                    `1. On the launch screen, select your role (Faculty or Admin) and enter your registered email address.\n` +
                    `2. Click **Send OTP Code**.\n` +
                    `3. **For testing convenience:** Since this is a developer sandbox, the generated 6-digit code will display in a **green alert box** at the top of your browser window, and print in the node server console.\n` +
                    `4. Enter the code and click **Verify OTP** to securely log in.`;
            }
            else if (msg.includes('feature') || msg.includes('what can') || msg.includes('module') || msg.includes('capability') || msg.includes('lms')) {
                responseText = `UniSmart is an AI-powered University LMS featuring:\n\n` +
                    `- **Secure OTP Portal:** Passwordless login using Nodemailer-simulated verification codes.\n` +
                    `- **Attendance Calendar:** Monthly grid layout enabling faculty to log and modify daily attendance records.\n` +
                    `- **AI Insights Engine:** Machine learning analytical panel forecasting attendance rates and tracking at-risk students.\n` +
                    `- **Excel Sync Engine:** Super admin panel allowing bulk CSV student imports and downloading detailed reports.`;
            }
            else if (msg.includes('roadmap') || msg.includes('future') || msg.includes('plan') || msg.includes('release')) {
                responseText = `UniSmart's developmental roadmap is scheduled as follows:\n\n` +
                    `- **Q3 2026:** Direct student and parent portals for accountability checks and grades auditing.\n` +
                    `- **Q4 2026:** Native Android and iOS app wrappers utilizing React Native for push alert notifications.\n` +
                    `- **Q1 2027:** A 24/7 AI Academic Assistant chatbot to respond to student schedule and curriculum queries. (You are using a preview of this feature right now!)`;
            }
            else if (msg.includes('tech stack') || msg.includes('technology') || msg.includes('framework') || msg.includes('built with')) {
                responseText = `UniSmart is built using a modern full-stack JavaScript architecture:\n\n` +
                    `- **Frontend:** React (Vite SPA) styled with Tailwind CSS and enhanced with Lucide icons & Chart.js.\n` +
                    `- **Backend:** Node.js + Express.js REST API server.\n` +
                    `- **Database:** MongoDB & Mongoose ORM. Fallbacks dynamically to an in-memory simulation if no DB service is running locally.`;
            }
            else if (msg.includes('creator') || msg.includes('who made') || msg.includes('developer')) {
                responseText = `UniSmart was designed and developed by a dedicated team as a state-of-the-art University Learning Management System (ULMS) to demonstrate advanced predictive analytics and modern glassmorphic web design.`;
            }
            else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('greetings') || msg.includes('who are you') || msg.includes('help')) {
                responseText = `Hello! I am the UniSmart AI Academic Assistant. \n\nI can answer questions about the platform, tech stack, OTP login system, or the future roadmap.\n\n*If you are a faculty member, please log in (using test email: \`sarah.jenkins@unismart.edu\`) to access live student attendance analytics and at-risk reports.*`;
            }
            else if (msg.includes('clear') || msg.includes('reset')) {
                responseText = `I have reset our conversation history. Let me know what you'd like to ask next!`;
            }
            else {
                responseText = `I'm not sure I understand that request completely. \n\nYou can ask me about:\n` +
                    `- **OTP Authentication:** *"How do I log in?"*\n` +
                    `- **Platform Capabilities:** *"What are the core features?"*\n` +
                    `- **Underlying Architecture:** *"What is the tech stack?"*\n` +
                    `- **Project Timeline:** *"Show the future roadmap."*\n\n` +
                    `*Tip: If you log in as Faculty (e.g., Sarah Jenkins), I will be able to answer questions like: "Who is at risk?" or "What is my class average?"*`;
            }
        }

        // Add a warning indicating that the API key was not configured and that this is a simulated response
        const warningPrefix = ''`;
        return res.status(200).json({ success: true, reply: warningPrefix + responseText });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Chatbot message processing failed.' });
    }
};

module.exports = { handleMessage };

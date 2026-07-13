/* ==========================================================================
   UNISMART APPLICATION LOGIC - INTERACTIVE FRONTEND PROTOTYPE
   ========================================================================== */

// Initial State Database (Mock DB)
const state = {
    currentRole: 'admin', // default selected role
    currentUser: null,
    
    facultyList: [
        { name: 'Dr. Sarah Jenkins', department: 'Computer Science', email: 'sarah.jenkins@unismart.edu', role: 'Professor', status: 'Active' },
        { name: 'Dr. Alan Turing', department: 'Mathematics', email: 'alan.turing@unismart.edu', role: 'Professor', status: 'Active' },
        { name: 'Prof. Grace Hopper', department: 'Computer Science', email: 'grace.hopper@unismart.edu', role: 'Associate Professor', status: 'Active' },
        { name: 'Dr. Richard Feynman', department: 'Physics', email: 'richard.feynman@unismart.edu', role: 'Professor', status: 'Active' },
        { name: 'Dr. Katherine Johnson', department: 'Mathematics', email: 'katherine.j@unismart.edu', role: 'Associate Professor', status: 'Active' }
    ],
    
    studentList: [
        { name: 'Alice Smith', roll: 'CS-2026-001', attendance: 89, status: 'Active', email: 'alice.smith@unismart.edu' },
        { name: 'Bob Jones', roll: 'CS-2026-002', attendance: 72, status: 'At-Risk', email: 'bob.jones@unismart.edu' },
        { name: 'Charlie Brown', roll: 'CS-2026-003', attendance: 95, status: 'Active', email: 'charlie.brown@unismart.edu' },
        { name: 'Diana Prince', roll: 'CS-2026-004', attendance: 64, status: 'At-Risk', email: 'diana.prince@unismart.edu' },
        { name: 'Ethan Hunt', roll: 'CS-2026-005', attendance: 78, status: 'Active', email: 'ethan.hunt@unismart.edu' },
        { name: 'Fiona Gallagher', roll: 'CS-2026-006', attendance: 83, status: 'Active', email: 'fiona.gallagher@unismart.edu' },
        { name: 'George Clark', roll: 'CS-2026-007', attendance: 58, status: 'At-Risk', email: 'george.clark@unismart.edu' },
        { name: 'Hannah Abbott', roll: 'CS-2026-008', attendance: 91, status: 'Active', email: 'hannah.abbott@unismart.edu' },
        { name: 'Ian Malcolm', roll: 'CS-2026-009', attendance: 80, status: 'Active', email: 'ian.malcolm@unismart.edu' },
        { name: 'Julia Roberts', roll: 'CS-2026-010', attendance: 87, status: 'Active', email: 'julia.roberts@unismart.edu' }
    ],
    
    // Attendance logs keyed by date string (YYYY-MM-DD)
    attendanceLogs: {
        '2026-07-01': { 'CS-2026-001': 'P', 'CS-2026-002': 'P', 'CS-2026-003': 'P', 'CS-2026-004': 'A', 'CS-2026-005': 'P', 'CS-2026-006': 'P', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'P', 'CS-2026-010': 'P' },
        '2026-07-02': { 'CS-2026-001': 'P', 'CS-2026-002': 'A', 'CS-2026-003': 'P', 'CS-2026-004': 'A', 'CS-2026-005': 'P', 'CS-2026-006': 'P', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'A', 'CS-2026-010': 'P' },
        '2026-07-03': { 'CS-2026-001': 'P', 'CS-2026-002': 'P', 'CS-2026-003': 'P', 'CS-2026-004': 'P', 'CS-2026-005': 'P', 'CS-2026-006': 'P', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'P', 'CS-2026-010': 'P' },
        '2026-07-06': { 'CS-2026-001': 'P', 'CS-2026-002': 'P', 'CS-2026-003': 'P', 'CS-2026-004': 'P', 'CS-2026-005': 'P', 'CS-2026-006': 'A', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'P', 'CS-2026-010': 'P' },
        '2026-07-07': { 'CS-2026-001': 'P', 'CS-2026-002': 'A', 'CS-2026-003': 'P', 'CS-2026-004': 'P', 'CS-2026-005': 'A', 'CS-2026-006': 'P', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'P', 'CS-2026-010': 'P' },
        '2026-07-08': { 'CS-2026-001': 'P', 'CS-2026-002': 'P', 'CS-2026-003': 'P', 'CS-2026-004': 'A', 'CS-2026-005': 'P', 'CS-2026-006': 'P', 'CS-2026-007': 'A', 'CS-2026-008': 'P', 'CS-2026-009': 'P', 'CS-2026-010': 'P' }
    },
    
    notifications: [
        { id: 1, title: 'Database Online', desc: 'Connected successfully to virtual MongoDB Atlas cluster.', time: '10 mins ago', read: false },
        { id: 2, title: 'AI Module Loaded', desc: 'Predictive analysis LSTM model initialized with accuracy 87.2%.', time: '5 mins ago', read: false }
    ],
    
    // Calendar configurations
    selectedDate: '2026-07-09',
    calendarYear: 2026,
    calendarMonth: 6, // July (0-indexed)
    
    // Chart References
    charts: {
        forecast: null,
        risk: null
    }
};

// Simulated Email OTP State
let currentSimulatedOtp = '';

// DOM Elements
const elements = {
    marketingHeader: document.getElementById('marketingHeader'),
    marketingView: document.getElementById('marketingView'),
    authView: document.getElementById('authView'),
    dashboardView: document.getElementById('dashboardView'),
    
    btnLaunchPortal: document.getElementById('btnLaunchPortal'),
    heroStartBtn: document.getElementById('heroStartBtn'),
    btnExitAuth: document.getElementById('btnExitAuth'),
    
    // Auth flow steps
    authStepEmail: document.getElementById('authStepEmail'),
    authStepOtp: document.getElementById('authStepOtp'),
    authEmail: document.getElementById('authEmail'),
    simulatedOtpCode: document.getElementById('simulatedOtpCode'),
    btnSendOtp: document.getElementById('btnSendOtp'),
    btnVerifyOtp: document.getElementById('btnVerifyOtp'),
    btnBackToEmail: document.getElementById('btnBackToEmail'),
    otpDigits: document.querySelectorAll('.otp-digit'),
    
    // Sidebar User Badges
    sidebarAvatar: document.getElementById('sidebarAvatar'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserRole: document.getElementById('sidebarUserRole'),
    sidebarNavItems: document.getElementById('sidebarNavItems'),
    btnLogOut: document.getElementById('btnLogOut'),
    btnBackToLobby: document.getElementById('btnBackToLobby'),
    
    // Top Bar Headers
    dashViewTitle: document.getElementById('dashViewTitle'),
    dashViewSubtitle: document.getElementById('dashViewSubtitle'),
    btnNotifBell: document.getElementById('btnNotifBell'),
    notifPanel: document.getElementById('notifPanel'),
    btnCloseNotifPanel: document.getElementById('btnCloseNotifPanel'),
    notifPanelList: document.getElementById('notifPanelList'),
    
    // Admin Dashboard Elements
    tabAdminOverview: document.getElementById('tabAdminOverview'),
    adminStatFacultyCount: document.getElementById('adminStatFacultyCount'),
    adminStatStudentCount: document.getElementById('adminStatStudentCount'),
    formCreateFaculty: document.getElementById('formCreateFaculty'),
    tableFacultyRoster: document.getElementById('tableFacultyRoster'),
    csvDropzone: document.getElementById('csvDropzone'),
    csvFileInput: document.getElementById('csvFileInput'),
    uploadProgressBox: document.getElementById('uploadProgressBox'),
    uploadBarFill: document.getElementById('uploadBarFill'),
    uploadPercent: document.getElementById('uploadPercent'),
    lnkDownloadDemoCsv: document.getElementById('lnkDownloadDemoCsv'),
    searchFacultyTable: document.getElementById('searchFacultyTable'),
    
    // Faculty Dashboard Elements
    tabFacultyAttendance: document.getElementById('tabFacultyAttendance'),
    tabFacultyAIInsights: document.getElementById('tabFacultyAIInsights'),
    facStatAvgAttendance: document.getElementById('facStatAvgAttendance'),
    facStatAtRiskCount: document.getElementById('facStatAtRiskCount'),
    facStatAIPredict: document.getElementById('facStatAIPredict'),
    calendarMonthTitle: document.getElementById('calendarMonthTitle'),
    calendarDaysGrid: document.getElementById('calendarDaysGrid'),
    btnPrevMonth: document.getElementById('btnPrevMonth'),
    btnNextMonth: document.getElementById('btnNextMonth'),
    loggerHeaderDate: document.getElementById('loggerHeaderDate'),
    loggerStatusText: document.getElementById('loggerStatusText'),
    studentLoggerList: document.getElementById('studentLoggerList'),
    btnBatchPresent: document.getElementById('btnBatchPresent'),
    btnBatchAbsent: document.getElementById('btnBatchAbsent'),
    btnExportAttendanceReport: document.getElementById('btnExportAttendanceReport'),
    tableRiskRoster: document.getElementById('tableRiskRoster'),
    
    // Student Dashboard Elements
    tabStudentOverview: document.getElementById('tabStudentOverview'),
    studentHeadingName: document.getElementById('studentHeadingName'),
    studentEligibilityStatus: document.getElementById('studentEligibilityStatus'),
    studentProgressRing: document.getElementById('studentProgressRing'),
    studentCirclePercentage: document.getElementById('studentCirclePercentage'),
    studentStatClassesAttended: document.getElementById('studentStatClassesAttended'),
    studentStatClassesAllowedToSkip: document.getElementById('studentStatClassesAllowedToSkip'),
    studentAiAlertsBox: document.getElementById('studentAiAlertsBox'),
    studentPersonalLogTable: document.getElementById('studentPersonalLogTable')
};

/* ==========================================================================
   NAVIGATION & ROUTING
   ========================================================================== */

function showLobby() {
    elements.marketingHeader.classList.remove('hidden');
    elements.marketingView.classList.remove('hidden');
    elements.authView.classList.add('hidden');
    elements.dashboardView.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showAuth() {
    elements.authView.classList.remove('hidden');
    elements.authEmail.focus();
    // Default form configuration
    elements.authStepEmail.classList.remove('hidden');
    elements.authStepOtp.classList.add('hidden');
    elements.authEmail.value = getRoleDefaultEmail(state.currentRole);
}

function closeAuth() {
    elements.authView.classList.add('hidden');
}

function getRoleDefaultEmail(role) {
    if (role === 'admin') return 'admin@unismart.edu';
    if (role === 'faculty') return 'sarah.jenkins@unismart.edu';
    return 'alice.smith@unismart.edu';
}

function navigateToDashboard(role) {
    elements.marketingHeader.classList.add('hidden');
    elements.marketingView.classList.add('hidden');
    elements.authView.classList.add('hidden');
    elements.dashboardView.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Set user profile
    if (role === 'admin') {
        state.currentUser = { name: 'Super Admin Core', role: 'Super Admin', email: 'admin@unismart.edu' };
    } else if (role === 'faculty') {
        state.currentUser = { name: 'Dr. Sarah Jenkins', role: 'Faculty Professor', email: 'sarah.jenkins@unismart.edu' };
    } else {
        state.currentUser = { name: 'Alice Smith', role: 'Student (CS Roster)', email: 'alice.smith@unismart.edu' };
    }
    
    updateSidebarProfile();
    renderSidebarNavigation();
    
    // Switch to default tab depending on role
    if (role === 'admin') {
        switchTab('admin-overview');
    } else if (role === 'faculty') {
        switchTab('faculty-attendance');
    } else {
        switchTab('student-overview');
    }
    
    // Trigger confetti
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
    });
}

function updateSidebarProfile() {
    elements.sidebarUserName.textContent = state.currentUser.name;
    elements.sidebarUserRole.textContent = state.currentUser.role;
    elements.sidebarAvatar.textContent = state.currentUser.name.charAt(0);
}

function renderSidebarNavigation() {
    let navHtml = '';
    const role = state.currentRole;
    
    if (role === 'admin') {
        navHtml = `
            <a class="nav-item active" data-tab="admin-overview">
                <i data-lucide="layout-dashboard"></i>
                <span>Admin Overview</span>
            </a>
            <a class="nav-item" data-tab="admin-faculty-mgmt">
                <i data-lucide="presentation"></i>
                <span>Faculty Roster</span>
            </a>
            <a class="nav-item" data-tab="admin-student-upload">
                <i data-lucide="upload-cloud"></i>
                <span>Student Database</span>
            </a>
        `;
    } else if (role === 'faculty') {
        navHtml = `
            <a class="nav-item active" data-tab="faculty-attendance">
                <i data-lucide="calendar-check"></i>
                <span>Class Attendance</span>
            </a>
            <a class="nav-item" data-tab="faculty-ai-insights">
                <i data-lucide="sparkles"></i>
                <span>AI Insights Engine</span>
            </a>
        `;
    } else if (role === 'student') {
        navHtml = `
            <a class="nav-item active" data-tab="student-overview">
                <i data-lucide="user"></i>
                <span>My Attendance Card</span>
            </a>
        `;
    }
    
    elements.sidebarNavItems.innerHTML = navHtml;
    lucide.createIcons();
    
    // Rebind clicks
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            
            // Set active sidebar item class
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.add('hidden'));
    
    if (tabId === 'admin-overview' || tabId === 'admin-faculty-mgmt' || tabId === 'admin-student-upload') {
        elements.tabAdminOverview.classList.remove('hidden');
        elements.dashViewTitle.textContent = "Super Admin Portal";
        elements.dashViewSubtitle.textContent = "Manage faculty, sync student databases, and audit permissions.";
        
        // Internal sub-tab highlights
        if (tabId === 'admin-faculty-mgmt') {
            document.getElementById('formCreateFaculty').scrollIntoView({ behavior: 'smooth' });
        } else if (tabId === 'admin-student-upload') {
            document.getElementById('csvDropzone').scrollIntoView({ behavior: 'smooth' });
        }
        
        renderAdminRosters();
    } 
    else if (tabId === 'faculty-attendance') {
        elements.tabFacultyAttendance.classList.remove('hidden');
        elements.dashViewTitle.textContent = "Faculty Attendance Grid";
        elements.dashViewSubtitle.textContent = "Log daily class attendance logs, export reports, and analyze predictions.";
        
        renderFacultyAttendanceWorkspace();
    }
    else if (tabId === 'faculty-ai-insights') {
        elements.tabFacultyAIInsights.classList.remove('hidden');
        elements.dashViewTitle.textContent = "AI Smart Insights";
        elements.dashViewSubtitle.textContent = "Machine learning predictive modeling for attendance thresholds and dropout preventions.";
        
        renderAIInsightsDashboard();
    }
    else if (tabId === 'student-overview') {
        elements.tabStudentOverview.classList.remove('hidden');
        elements.dashViewTitle.textContent = "Student Attendance Log";
        elements.dashViewSubtitle.textContent = "Verify attendance statistics, review AI warnings, and submit corrections.";
        
        renderStudentWorkspace();
    }
}

/* ==========================================================================
   AUTHENTICATION LOGIC
   ========================================================================== */

function handleSendOtp() {
    const email = elements.authEmail.value;
    if (!email || !validateEmail(email)) {
        alert("Please enter a valid university email address.");
        return;
    }
    
    // Generate a random 4-digit code
    currentSimulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    elements.simulatedOtpCode.textContent = currentSimulatedOtp;
    
    // Switch auth card states
    elements.authStepEmail.classList.add('hidden');
    elements.authStepOtp.classList.remove('hidden');
    
    // Reset OTP inputs
    elements.otpDigits.forEach(input => input.value = '');
    elements.otpDigits[0].focus();
    
    // Add success notification
    addNotification("OTP Sent", `A verification code was dispatched to ${email}.`, 'unread');
}

function handleVerifyOtp() {
    let enteredOtp = '';
    elements.otpDigits.forEach(input => enteredOtp += input.value);
    
    if (enteredOtp === currentSimulatedOtp || enteredOtp === '1234') { // Allow 1234 fallback for convenience
        // Successful login
        navigateToDashboard(state.currentRole);
    } else {
        alert("Invalid verification code! Enter the code shown in the green notification box above or try '1234'.");
    }
}

// Bind OTP key shifts
elements.otpDigits.forEach((digit, idx) => {
    digit.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && idx < elements.otpDigits.length - 1) {
            elements.otpDigits[idx + 1].focus();
        }
    });
    digit.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value.length === 0 && idx > 0) {
            elements.otpDigits[idx - 1].focus();
        }
    });
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==========================================================================
   SUPER ADMIN MODULE
   ========================================================================== */

function renderAdminRosters() {
    // Stat counters
    elements.adminStatFacultyCount.textContent = state.facultyList.length;
    elements.adminStatStudentCount.textContent = state.studentList.length;
    
    // Render Faculty Table
    const filter = elements.searchFacultyTable.value.toLowerCase();
    let rowsHtml = '';
    
    state.facultyList.forEach(fac => {
        if (fac.name.toLowerCase().includes(filter) || fac.department.toLowerCase().includes(filter) || fac.email.toLowerCase().includes(filter)) {
            rowsHtml += `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: #fff;">${fac.name}</div>
                    </td>
                    <td>${fac.department}</td>
                    <td>${fac.email}</td>
                    <td>${fac.role}</td>
                    <td><span class="status-badge badge-active">${fac.status}</span></td>
                </tr>
            `;
        }
    });
    
    elements.tableFacultyRoster.innerHTML = rowsHtml;
}

// Register new faculty
elements.formCreateFaculty.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newFac = {
        name: document.getElementById('facName').value,
        department: document.getElementById('facDept').value,
        role: document.getElementById('facRole').value,
        email: document.getElementById('facEmail').value,
        status: 'Active'
    };
    
    state.facultyList.push(newFac);
    elements.formCreateFaculty.reset();
    
    renderAdminRosters();
    
    addNotification("Faculty Registered", `${newFac.name} was successfully registered inside the ${newFac.department} department.`, 'unread');
    
    confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
    });
});

// Search faculty table
elements.searchFacultyTable.addEventListener('input', renderAdminRosters);

// CSV Upload Simulation
elements.csvDropzone.addEventListener('click', () => {
    elements.csvFileInput.click();
});

elements.csvDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.csvDropzone.classList.add('dragover');
});

elements.csvDropzone.addEventListener('dragleave', () => {
    elements.csvDropzone.classList.remove('dragover');
});

elements.csvDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.csvDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        simulateCsvUpload(e.dataTransfer.files[0].name);
    }
});

elements.csvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        simulateCsvUpload(e.target.files[0].name);
    }
});

// Fast upload simulation
function simulateCsvUpload(filename) {
    elements.uploadFileName.textContent = filename;
    elements.uploadProgressBox.classList.remove('hidden');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 15;
        if (progress > 100) progress = 100;
        
        elements.uploadBarFill.style.width = `${progress}%`;
        elements.uploadPercent.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                // Add students
                const importedCount = importMockRoster();
                elements.uploadProgressBox.classList.add('hidden');
                
                addNotification("Database Synced", `Successfully parsed CSV and populated database with ${importedCount} student accounts.`, 'unread');
                
                confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { y: 0.5 }
                });
                
                renderAdminRosters();
            }, 500);
        }
    }, 150);
}

function importMockRoster() {
    const mockRoster = [
        { name: 'John Doe', roll: 'CS-2026-011', attendance: 82, status: 'Active', email: 'john.doe@unismart.edu' },
        { name: 'Bruce Wayne', roll: 'CS-2026-012', attendance: 45, status: 'At-Risk', email: 'bruce.wayne@unismart.edu' },
        { name: 'Clark Kent', roll: 'CS-2026-013', attendance: 99, status: 'Active', email: 'clark.kent@unismart.edu' },
        { name: 'Barry Allen', roll: 'CS-2026-014', attendance: 90, status: 'Active', email: 'barry.allen@unismart.edu' },
        { name: 'Selina Kyle', roll: 'CS-2026-015', attendance: 71, status: 'At-Risk', email: 'selina.kyle@unismart.edu' }
    ];
    
    let count = 0;
    mockRoster.forEach(student => {
        // Check if student exists already
        if (!state.studentList.some(s => s.roll === student.roll)) {
            state.studentList.push(student);
            count++;
        }
    });
    return count;
}

// Download Demo Template CSV
elements.lnkDownloadDemoCsv.addEventListener('click', (e) => {
    e.preventDefault();
    const csvContent = "Name,RollNumber,Email\nJohn Doe,CS-2026-011,john.doe@unismart.edu\nBruce Wayne,CS-2026-012,bruce.wayne@unismart.edu\nClark Kent,CS-2026-013,clark.kent@unismart.edu";
    triggerBlobDownload(csvContent, "unismart_template_roster.csv", "text/csv");
});

function triggerBlobDownload(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ==========================================================================
   FACULTY MODULE & ATTENDANCE LOGGER
   ========================================================================== */

function renderFacultyAttendanceWorkspace() {
    // Calculations
    let totalPercentSum = 0;
    let atRiskCount = 0;
    
    state.studentList.forEach(student => {
        totalPercentSum += student.attendance;
        if (student.attendance < 75) atRiskCount++;
    });
    
    const avgAttendance = (totalPercentSum / state.studentList.length).toFixed(1);
    elements.facStatAvgAttendance.textContent = `${avgAttendance}%`;
    elements.facStatAtRiskCount.textContent = atRiskCount;
    elements.facStatAIPredict.textContent = `${(parseFloat(avgAttendance) + 2.5).toFixed(1)}%`;
    
    renderCalendar();
    renderStudentLogger();
}

function renderCalendar() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    
    // Set Calendar Title
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    elements.calendarMonthTitle.textContent = `${monthNames[month]} ${year}`;
    
    // Clear old grid
    elements.calendarDaysGrid.innerHTML = '';
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Prev month padding days
    for (let i = firstDayIndex; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day prev-next';
        dayDiv.textContent = prevMonthDays - i + 1;
        elements.calendarDaysGrid.appendChild(dayDiv);
    }
    
    // Current month days
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day';
        dayDiv.textContent = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Add log marker classes
        if (state.attendanceLogs[dateStr]) {
            dayDiv.classList.add('logged');
        }
        
        if (state.selectedDate === dateStr) {
            dayDiv.classList.add('active');
        }
        
        dayDiv.addEventListener('click', () => {
            state.selectedDate = dateStr;
            document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');
            
            // Set Logger Headers
            elements.loggerHeaderDate.textContent = `Attendance: ${monthNames[month]} ${day}, ${year}`;
            renderStudentLogger();
        });
        
        elements.calendarDaysGrid.appendChild(dayDiv);
    }
}

// Shift Months
elements.btnPrevMonth.addEventListener('click', () => {
    state.calendarMonth--;
    if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
    }
    renderCalendar();
});

elements.btnNextMonth.addEventListener('click', () => {
    state.calendarMonth++;
    if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
    }
    renderCalendar();
});

// Render the attendance table logger
function renderStudentLogger(filterMode = 'all') {
    const activeLog = state.attendanceLogs[state.selectedDate] || {};
    let loggerHtml = '';
    
    state.studentList.forEach(student => {
        const status = activeLog[student.roll] || 'unlogged';
        
        if (filterMode === 'all' || 
            (filterMode === 'present' && status === 'P') || 
            (filterMode === 'absent' && status === 'A')) {
            
            loggerHtml += `
                <div class="student-logger-item">
                    <div>
                        <div class="student-logger-name">${student.name}</div>
                        <div class="student-logger-roll">${student.roll} &bull; Current Att: ${student.attendance}%</div>
                    </div>
                    <div class="logger-action-group">
                        <button class="log-btn log-btn-p ${status === 'P' ? 'active' : ''}" onclick="logAttendance('${student.roll}', 'P')">P</button>
                        <button class="log-btn log-btn-a ${status === 'A' ? 'active' : ''}" onclick="logAttendance('${student.roll}', 'A')">A</button>
                    </div>
                </div>
            `;
        }
    });
    
    elements.studentLoggerList.innerHTML = loggerHtml;
    
    // Set active filters color
    document.querySelectorAll('.logger-filters .btn-filter').forEach(btn => {
        if (btn.getAttribute('data-filter') === filterMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Status descriptor text
    const loggedCount = Object.keys(activeLog).length;
    if (loggedCount === 0) {
        elements.loggerStatusText.textContent = "Log session marks. Currently empty.";
        elements.loggerStatusText.className = "panel-sub color-teal";
    } else {
        const presentCount = Object.values(activeLog).filter(s => s === 'P').length;
        elements.loggerStatusText.textContent = `Completed log: ${presentCount} Present / ${loggedCount - presentCount} Absent.`;
        elements.loggerStatusText.className = "panel-sub";
    }
}

// Global logger helper
window.logAttendance = function(roll, status) {
    if (!state.attendanceLogs[state.selectedDate]) {
        state.attendanceLogs[state.selectedDate] = {};
    }
    
    // Toggle check
    if (state.attendanceLogs[state.selectedDate][roll] === status) {
        delete state.attendanceLogs[state.selectedDate][roll];
    } else {
        state.attendanceLogs[state.selectedDate][roll] = status;
    }
    
    // Clean empty logs
    if (Object.keys(state.attendanceLogs[state.selectedDate]).length === 0) {
        delete state.attendanceLogs[state.selectedDate];
    }
    
    // Update student's dynamic attendance percentage
    recalculateAttendancePercentages();
    renderFacultyAttendanceWorkspace();
};

function recalculateAttendancePercentages() {
    // Total logged days count in system
    const loggedDates = Object.keys(state.attendanceLogs);
    if (loggedDates.length === 0) return;
    
    state.studentList.forEach(student => {
        let attended = 0;
        let eligibleDays = 0;
        
        loggedDates.forEach(date => {
            const dayLog = state.attendanceLogs[date];
            if (dayLog[student.roll]) {
                eligibleDays++;
                if (dayLog[student.roll] === 'P') attended++;
            }
        });
        
        if (eligibleDays > 0) {
            student.attendance = Math.round((attended / eligibleDays) * 100);
            student.status = student.attendance < 75 ? 'At-Risk' : 'Active';
        }
    });
}

// Bind logger filters
document.querySelectorAll('.logger-filters .btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        renderStudentLogger(btn.getAttribute('data-filter'));
    });
});

// Batch operations
elements.btnBatchPresent.addEventListener('click', () => {
    if (!state.attendanceLogs[state.selectedDate]) {
        state.attendanceLogs[state.selectedDate] = {};
    }
    state.studentList.forEach(s => {
        state.attendanceLogs[state.selectedDate][s.roll] = 'P';
    });
    recalculateAttendancePercentages();
    renderFacultyAttendanceWorkspace();
});

elements.btnBatchAbsent.addEventListener('click', () => {
    if (!state.attendanceLogs[state.selectedDate]) {
        state.attendanceLogs[state.selectedDate] = {};
    }
    state.studentList.forEach(s => {
        state.attendanceLogs[state.selectedDate][s.roll] = 'A';
    });
    recalculateAttendancePercentages();
    renderFacultyAttendanceWorkspace();
});

// EXPORT ATTENDANCE REPORT CSV
elements.btnExportAttendanceReport.addEventListener('click', () => {
    let csv = "Student Name,Roll Number,Attendance Percentage,Eligibility Status\n";
    state.studentList.forEach(student => {
        const eligibility = student.attendance >= 75 ? "ELIGIBLE" : "AT RISK";
        csv += `"${student.name}","${student.roll}",${student.attendance}%,${eligibility}\n`;
    });
    
    triggerBlobDownload(csv, "unismart_attendance_report.csv", "text/csv");
    
    addNotification("Report Exported", "Overall attendance CSV dataset downloaded successfully.", 'unread');
    
    confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.6 }
    });
});

/* ==========================================================================
   FACULTY AI INSIGHTS ENGINE
   ========================================================================== */

function renderAIInsightsDashboard() {
    // 1. Fill intervention list table
    let tableHtml = '';
    const atRiskStudents = state.studentList.filter(s => s.attendance < 80);
    
    atRiskStudents.forEach(student => {
        const dropProb = Math.max(10, Math.round(100 - (student.attendance * 1.1) + Math.random() * 8));
        let riskColorClass = 'prob-low';
        let triggerCause = 'Consecutive absences';
        let recommendation = 'Send email alert + schedule 1-on-1 advisor review.';
        
        if (dropProb >= 60) {
            riskColorClass = 'prob-high';
            triggerCause = 'Attendance drop below 65% limit';
            recommendation = 'IMMEDIATE warning letter required. Parent notification trigger.';
        } else if (dropProb >= 40) {
            riskColorClass = 'prob-med';
            triggerCause = 'Irregular attendance in core practical modules';
            recommendation = 'Assign remedial tutorial assignments.';
        }
        
        tableHtml += `
            <tr>
                <td><div style="font-weight: 700; color: #fff;">${student.name}</div></td>
                <td>${student.roll}</td>
                <td>${student.attendance}%</td>
                <td>
                    <div class="probability-bar-container">
                        <span class="probability-num">${dropProb}%</span>
                        <div class="prob-bg">
                            <div class="prob-fill ${riskColorClass}" style="width: ${dropProb}%;"></div>
                        </div>
                    </div>
                </td>
                <td>${triggerCause}</td>
                <td>${recommendation}</td>
            </tr>
        `;
    });
    
    elements.tableRiskRoster.innerHTML = tableHtml || `<tr><td colspan="6" style="text-align: center;">No students currently flag critical AI thresholds!</td></tr>`;

    // 2. Draw Chart.js graphs
    setTimeout(() => {
        drawAIForecastChart();
        drawRiskMatrixChart();
    }, 100);
}

function drawAIForecastChart() {
    const ctx = document.getElementById('chartAIForecast').getContext('2d');
    
    // Destroy previous charts to reload new variables
    if (state.charts.forecast) {
        state.charts.forecast.destroy();
    }
    
    // Compute actual 6 days + 1 predicted
    const labels = ['Jul 3', 'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7', 'Jul 8', 'Jul 9 (Today)', 'Jul 10 (AI Forecast)'];
    const actualData = [78, 80, 80, 81, 79, 79, 81, null];
    const forecastData = [null, null, null, null, null, null, 81, 84];
    
    state.charts.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Logged Attendance (%)',
                    data: actualData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3
                },
                {
                    label: 'LSTM Predicted Attendance (%)',
                    data: forecastData,
                    borderColor: '#14b8a6',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#14b8a6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
                }
            },
            scales: {
                y: {
                    min: 50,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'transparent' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function drawRiskMatrixChart() {
    const ctx = document.getElementById('chartRiskMatrix').getContext('2d');
    
    if (state.charts.risk) {
        state.charts.risk.destroy();
    }
    
    // Counts risk categories
    let low = 0;
    let med = 0;
    let high = 0;
    
    state.studentList.forEach(student => {
        if (student.attendance >= 80) low++;
        else if (student.attendance >= 70) med++;
        else high++;
    });
    
    state.charts.risk = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Low Risk (>=80%)', 'Medium Risk (70-79%)', 'High Risk (<70%)'],
            datasets: [{
                label: 'Student Count',
                data: [low, med, high],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', stepSize: 1 }
                },
                y: {
                    grid: { color: 'transparent' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

/* ==========================================================================
   STUDENT MODULE
   ========================================================================== */

function renderStudentWorkspace() {
    const student = state.studentList[0]; // Alice Smith simulator
    
    elements.studentHeadingName.textContent = student.name;
    
    // Circular Ring logic
    const percentage = student.attendance;
    elements.studentCirclePercentage.textContent = `${percentage}%`;
    
    // Stroke-dasharray is 502 (2 * pi * r where r=80).
    const strokeDashoffset = 502 - (502 * percentage) / 100;
    elements.studentProgressRing.style.strokeDashoffset = strokeDashoffset;
    
    // Color updates
    if (percentage >= 75) {
        elements.studentEligibilityStatus.textContent = "ELIGIBLE";
        elements.studentEligibilityStatus.className = "color-success";
        elements.studentProgressRing.style.stroke = "#10b981";
    } else {
        elements.studentEligibilityStatus.textContent = "AT-RISK";
        elements.studentEligibilityStatus.className = "color-danger";
        elements.studentProgressRing.style.stroke = "#ef4444";
    }
    
    // Stats
    const totalSessions = 40;
    const attended = Math.round((percentage / 100) * totalSessions);
    elements.studentStatClassesAttended.textContent = `${attended} / ${totalSessions}`;
    
    // Calculations for skip margin
    const allowedSkipCount = Math.max(0, Math.floor((attended - (0.75 * totalSessions))));
    elements.studentStatClassesAllowedToSkip.textContent = allowedSkipCount;
    
    // Personalized AI Alerts
    let alertsHtml = '';
    if (percentage < 90) {
        alertsHtml += `
            <div class="ai-rec-card rec-warning">
                <div class="rec-icon"><i data-lucide="alert-triangle"></i></div>
                <div class="rec-content">
                    <h4>Nearing Attendance Threshold</h4>
                    <p>Your attendance stands at ${percentage}%. To maintain safety indices, participate in the upcoming lab session scheduled on Friday.</p>
                </div>
            </div>
        `;
    }
    
    alertsHtml += `
        <div class="ai-rec-card rec-info">
            <div class="rec-icon"><i data-lucide="book-open"></i></div>
            <div class="rec-content">
                <h4>Course Material Optimization</h4>
                <p>AI modeling detects high engagement in Artificial Intelligence modules. Check out supplemental reading recommendations inside Chapter 4.</p>
            </div>
        </div>
        <div class="ai-rec-card rec-success">
            <div class="rec-icon"><i data-lucide="check-circle"></i></div>
            <div class="rec-content">
                <h4>Eligible status secured</h4>
                <p>Course attendance exceeds 75% baseline requirement. Academic eligibility is green-flagged.</p>
            </div>
        </div>
    `;
    
    elements.studentAiAlertsBox.innerHTML = alertsHtml;
    lucide.createIcons();
    
    // Personal Roster log table
    let logHtml = '';
    const dates = Object.keys(state.attendanceLogs).sort().reverse();
    
    dates.forEach(date => {
        const log = state.attendanceLogs[date];
        const status = log[student.roll] || 'A';
        const statusBadge = status === 'P' ? '<span class="status-badge badge-active">PRESENT</span>' : '<span class="status-badge badge-danger">ABSENT</span>';
        const verifyMethod = status === 'P' ? 'RFID Verification' : '-';
        
        logHtml += `
            <tr>
                <td>${date}</td>
                <td>Artificial Intelligence (CS-302)</td>
                <td>Dr. Sarah Jenkins</td>
                <td>${statusBadge}</td>
                <td>${verifyMethod}</td>
            </tr>
        `;
    });
    
    elements.studentPersonalLogTable.innerHTML = logHtml;
}

/* ==========================================================================
   NOTIFICATION SIDEBAR & ALERTS SYSTEM
   ========================================================================== */

function addNotification(title, desc, status = 'read') {
    const id = state.notifications.length + 1;
    const newNotif = {
        id: id,
        title: title,
        desc: desc,
        time: 'Just now',
        read: status === 'read'
    };
    
    state.notifications.unshift(newNotif);
    updateNotificationBadge();
    renderNotifications();
}

function updateNotificationBadge() {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        elements.btnNotifBell.querySelector('.notif-badge').classList.remove('hidden');
    } else {
        elements.btnNotifBell.querySelector('.notif-badge').classList.add('hidden');
    }
}

function renderNotifications() {
    let listHtml = '';
    state.notifications.forEach(notif => {
        listHtml += `
            <div class="notif-item ${notif.read ? '' : 'unread'}" onclick="markNotifRead(${notif.id})">
                <h4 class="notif-item-title">${notif.title}</h4>
                <p class="notif-item-desc">${notif.desc}</p>
                <span class="notif-item-time">${notif.time}</span>
            </div>
        `;
    });
    
    elements.notifPanelList.innerHTML = listHtml || `<div style="text-align: center; color: var(--text-muted); margin-top: 40px;">No alerts.</div>`;
}

window.markNotifRead = function(id) {
    const notif = state.notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        updateNotificationBadge();
        renderNotifications();
    }
};

elements.btnNotifBell.addEventListener('click', () => {
    elements.notifPanel.classList.toggle('hidden');
    renderNotifications();
});

elements.btnCloseNotifPanel.addEventListener('click', () => {
    elements.notifPanel.classList.add('hidden');
});

/* ==========================================================================
   INITIALIZATION & LOBBY EVENTS
   ========================================================================== */

// Launch Portal click
elements.btnLaunchPortal.addEventListener('click', showAuth);
elements.heroStartBtn.addEventListener('click', showAuth);
elements.btnExitAuth.addEventListener('click', closeAuth);
elements.btnBackToEmail.addEventListener('click', () => {
    elements.authStepOtp.classList.add('hidden');
    elements.authStepEmail.classList.remove('hidden');
});

// Role Switch selections
document.querySelectorAll('.role-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        state.currentRole = option.getAttribute('data-role');
        elements.authEmail.value = getRoleDefaultEmail(state.currentRole);
    });
});

// Auth submits
elements.btnSendOtp.addEventListener('click', handleSendOtp);
elements.btnVerifyOtp.addEventListener('click', handleVerifyOtp);

// Logouts
elements.btnLogOut.addEventListener('click', showLobby);
elements.btnBackToLobby.addEventListener('click', showLobby);

// Marketing success metrics counts animations
function triggerCounterAnimations() {
    const counters = document.querySelectorAll('.metric-val');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isMin = counter.textContent.includes('>');
        const isLess = counter.textContent.includes('<');
        let count = 0;
        const speed = target / 20;
        
        const updateCount = () => {
            count += speed;
            if (count >= target) {
                counter.textContent = (isMin ? '> ' : (isLess ? '< ' : '')) + Math.round(target) + (target === 85 ? '%' : (target === 10 ? 's' : 's'));
            } else {
                counter.textContent = Math.round(count) + (target === 85 ? '%' : 's');
                setTimeout(updateCount, 40);
            }
        };
        updateCount();
    });
}

// Initial launch check
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    triggerCounterAnimations();
    updateNotificationBadge();
});

# Product Requirement Document (PRD)
## UniSmart: AI-Powered University Learning Management System (ULMS)

| Metadata | Value |
| :--- | :--- |
| **Project Name** | UniSmart (ULMS) |
| **Document Version** | 1.0.0 |
| **Status** | Approved / Core Specification |
| **Target Audience** | Engineering Team, Product Stakeholders, Project Evaluators |
| **Last Updated** | July 12, 2026 |

---

## 1. Executive Summary & Product Vision

**UniSmart** is a modern, digital academic platform designed to streamline and automate essential university operations. The system coordinates role-based operations across administrative personnel and faculty, offering modules for student data onboarding, automated attendance monitoring, class reporting, and predictive analysis of student engagement.

At the core of UniSmart is a shift from **reactive attendance logs** to **proactive academic intervention**. By leveraging historical patterns and semester progress, the system identifies students at risk of chronic absenteeism, flagging them on administrative and faculty dashboards with actionable recommendations to prevent student attrition and academic failure.

---

## 2. Product Objectives

* **Role-Based Workspace Isolation:** Establish clear, authenticated boundaries for Super Admins and Faculty members.
* **Frictionless & Secure Auth:** Implement passwordless email validation using One-Time Passwords (OTPs) to minimize account sharing and credential loss.
* **Bulk Data Onboarding:** Standardize roster updates by allowing administrators to upload Excel/CSV rosters to register hundreds of students and link them to faculty members instantly.
* **Interactive Class Management:** Provide faculty with a responsive, monthly calendar interface to view rosters and log attendance with minimal overhead.
* **Seamless Reporting:** Support single-click reports, exporting attendance histories into standardized Excel spreadsheets.
* **AI-Driven Preventive Risk Management:** Build an intelligent analytics system (Smart Attendance Insights) to identify absenteeism trends early, displaying color-coded risk indicators and suggesting next-step actions.
* **Accessible Dashboard Design:** Incorporate audio feedback cues for key operations to support accessible, multi-modal feedback loops.

---

## 3. User Roles & Personas

### 3.1 Super Admin
* **Description:** University Registrars or administrative IT staff responsible for setting up academic rosters.
* **Core Goal:** To onboard faculty, associate student groups with faculty mentors, and monitor department-wide attendance health.
* **Key User Journeys:**
  1. Creating and updating Faculty accounts for a given Academic Year.
  2. Importing student directories in bulk using pre-defined Excel/CSV templates.
  3. Visualizing department-wide risk heatmaps to identify underperforming cohorts.

### 3.2 Faculty
* **Description:** Professors, lecturers, or instructors who conduct classes.
* **Core Goal:** To record daily attendance, review individual student records, identify struggling students, and export attendance records.
* **Key User Journeys:**
  1. Logging in using a secure email-based OTP.
  2. Selecting dates on a calendar grid to mark or update student attendance.
  3. Exporting formatted attendance reports for administrative reviews.
  4. Viewing AI-predicted risk profiles and sending recommendations/follow-ups to at-risk students.

### 3.3 Students (Data Subject / Passive Actor)
* **Description:** Enrolled university students.
* **Core Goal:** Maintain healthy attendance, receive timely academic support when flags are raised, and verify their enrollment records.
* **Key Role in System:** Enrolled via bulk upload; attendance is logged against their profile; actions are recommended to address their attendance deficits.

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
* **Passwordless OTP Login:** 
  - Users enter their official university email on the login screen.
  - The backend verifies email registration, generates a 6-digit cryptographic OTP, and sends it via email (using Nodemailer).
  - The login screen redirects to an OTP verification panel. Upon successful verification, the user receives a role-scoped JSON Web Token (JWT).
* **Role-Based Access Control (RBAC):**
  - Admins and Faculty are routed to `/admin/dashboard` and `/faculty/dashboard` respectively.
  - Interceptors prevent Faculty from accessing Admin APIs and vice versa.

### 4.2 Landing Page (Lobby)
* **Path:** `/`
* **Features:**
  - Introduction to the UniSmart ULMS ecosystem.
  - Clear, prominent routing buttons: "Login as Admin" (routes to `/admin/login`) and "Login as Faculty" (routes to `/faculty/login`).
  - Sleek, modern aesthetics using Tailwind CSS, including dark-mode support and micro-animations.

### 4.3 Super Admin Dashboard
* **Path:** `/admin/dashboard`
* **Features:**
  * **Faculty Management ("Create Faculty"):**
    - Input form: Name, Email, Department, and Academic Year (e.g., `2025-2026`).
    - Action: Creates a faculty profile, sets status to `Active`, and sends a welcome notification with details on logging in.
  * **Roster Management ("Upload Students"):**
    - Interface to select a target Faculty member.
    - Drag-and-drop or file selector to upload Excel (`.xlsx`, `.xls`) or CSV (`.csv`) sheets.
    - Parsed fields: `Student Name`, `Roll Number`, `Email`, and `Batch`.
    - Automatically links these students to the selected Faculty member.
  * **AI Attendance Risk Overview:**
    - High-level, department-wide analytics.
    - Interactive **Batch Heatmaps** indicating attendance rates across cohorts.
    - Risk indicators showing the count of students categorized as `High Risk` or `Medium Risk`.
    - List of at-risk students across all departments for administrative outreach.

### 4.4 Faculty Dashboard
* **Path:** `/faculty/dashboard`
* **Features:**
  * **Interactive Calendar View:**
    - Display of current month with navigation (previous/next).
    - Selecting a date loads the student roster assigned to that Faculty member.
    - Checkboxes/toggles next to each student to log "Present" or "Absent".
    - "Save" button to commit records. Plays a positive confirmation audio chime on success, or an alert sound on failure.
  * **Detailed Attendance Reporting:**
    - "Download Excel Report" button.
    - Generates an `.xlsx` file detailing: `Student Name`, `Roll Number`, `Dates Present`, `Total Class Days`, and `Attendance Percentage`.
  * **Smart Attendance Insights (SAI) Panel:**
    - Sidebar or panel displaying predictive analytics.
    - Visual representation of each student's "Engagement Score" and "Drop Risk".
    - Alerts for students whose attendance is projected to slip below the 75% university requirement.
    - Actionable recommendation prompts.

---

## 5. AI Feature: Smart Attendance Insights (SAI)

The SAI module utilizes historical attendance rates, semester timeline progress, and student-specific engagement metrics to evaluate absenteeism risks.

### 5.1 Analytics Logic & Thresholds
* **Engagement Score Calculation:** A formula factoring in attendance rate over time, consecutive absences, and department-level historical benchmarks.
* **Risk Categorization:**
  * **Low Risk (Green):** Attendance >= 80%. Student is on track.
  * **Medium Risk (Yellow):** Attendance between 70% and 79%. At risk of falling below the academic threshold.
  * **High Risk (Red):** Attendance < 70%. Highly likely to fail or experience chronic absenteeism.
* **Predictive ML Modeling:**
  - Input: Current attendance logs + Semester elapsed percentage (e.g., Week 6 of 16).
  - Target: Predict whether the student's final attendance will fall below the 75% passing mark.
  - Alerts: Displays alert cards highlighting critical students.

### 5.2 Actionable Recommendations Engine
The dashboard generates dynamic suggestions based on risk levels:
* *For Medium Risk:* "Consider sending an automated reminder email to batch [Batch Name]" or "Check in with [Student Name] during office hours."
* *For High Risk:* "Schedule a 1-on-1 counseling intervention with [Student Name] immediately" or "Flag profile for Super Admin notification."

---

## 6. Secondary / Media Integrations

### 6.1 Audio Accessibility & Micro-Feedback
* Integration of **HTML5 Audio API / Howler.js** on the client side.
* Play sounds for primary system transitions:
  - *Success Chime:* Played upon saving attendance data successfully or after a successful Excel upload.
  - *Warning Tone:* Played when an attendance save fails, or when a high-risk student profile is loaded.

### 6.2 Remote Storage Integration
* **Firebase Storage / Cloudinary:**
  - Secure uploads of Excel/CSV rosters for archival.
  - Storing system media assets, logos, and faculty profile avatars.

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Latency
* **API Response Time:** OTP verification and token generation should take less than 1.5 seconds.
* **Report Generation:** Exporting reports via ExcelJS should construct and stream files within 5 seconds for a cohort of 500 students.
* **Data Parsing:** Uploading and importing a roster of 100 students should execute in under 3 seconds.

### 7.2 Security & Compliance
* **Secure API Guarding:** All backend routes except public authentication routes must require a valid Bearer JWT.
* **Data Encryption:** User passwords (if any) and OTPs must be stored hashed via Bcrypt.
* **Session Expiry:** JWT tokens expire after 24 hours. OTPs expire strictly 5 minutes after creation.

### 7.3 Compatibility & Responsive Design
* **Browser Compatibility:** Fully supports Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.
* **Responsiveness:** Designed with a mobile-first approach using Tailwind CSS. Dashboard displays transition seamlessly from mobile layouts (single-column) to large desktop monitors.

---

## 8. User Interface (UI) Wireframe Architecture

```
[Landing Page (Lobby)]
      |
      +---> [Admin Login] ----> [Admin Dashboard]
      |                              |--> Create Faculty (Modal/Form)
      |                              |--> Upload Students (Excel File Drag-and-Drop)
      |                              |--> Batch Attendance Risk Heatmap
      |
      +---> [Faculty Login] --> [Faculty Dashboard]
                                     |--> Monthly Calendar Grid
                                     |--> Checkbox Roster list
                                     |--> SAI Panel (At-Risk Alerts & Recommendations)
                                     |--> Export Excel Button
```

---

## 9. Future Scope & Roadmap (Out of Scope for V1)
* **Student Dashboard Portal:** Direct access for students to view their calendar attendance, track risk levels, and upload excuse notes (e.g., medical certificates) directly to Cloud Storage.
* **Auto-Alert Integration:** Triggering SMS/Email alerts automatically to parents or students when a high-risk flag is generated.
* **LMS Course Content Integration:** Incorporating class lectures, files, and assignments into the calendar.

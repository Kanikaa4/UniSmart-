# UniSmart Full-Stack Learning Management System (LMS)

An AI-powered University Learning Management System (ULMS) developed with React (Vite) + Tailwind CSS on the frontend, and Node.js (Express) + MongoDB on the backend.

---

## 1. Project Organization
The project is structured into two main subfolders:
* **`server/`**: Express.js server exposing REST APIs, integrating JWT authentication, Nodemailer OTP triggers, Multer files parsers, and Mongoose database connections.
* **`client/`**: React.js SPA built via Vite, featuring custom glassmorphism components, circular SVG dashboards, and interactive Chart.js reports.

---

## 2. Quick Start Instructions

To run this application locally, you will need to boot up both the server backend and the client frontend:

### Step 2.1: Boot up the Backend Server
1. Open a PowerShell terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install npm dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
   *The server runs on http://localhost:5000.*
   *Note: If no MongoDB is running, the server will fallback to a simulated in-memory store so it does not crash!*

### Step 2.2: Boot up the Frontend Client
1. Open a second PowerShell terminal window and navigate to the client folder:
   ```bash
   cd client
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open the outputted URL (default is `http://localhost:5173`) in your browser to launch the platform!

---

## 3. How to Test Verification Codes (OTP)

When logging in:
1. Select a role and input the email address.
2. Click **Send OTP Code**.
3. Retrieve the generated code:
   * It will print directly inside the **Server Node.js Terminal Console**.
   * For testing convenience, it will also display in a **green indicator box** inside the browser app so you can copy and verify it immediately.

### Default Test Profiles
- **Super Admin**: `admin@unismart.edu`
- **Faculty Member**: `sarah.jenkins@unismart.edu`

# HostelHub - Smart Hostel Management System

## Overview
HostelHub is a comprehensive, modern, and offline-first hostel management system designed to streamline operations for both students and wardens. Built with React, Firebase, and Tailwind CSS, HostelHub provides real-time updates and seamless management of complaints, leave requests, room services, notices, and night attendance.

## Features
- **Role-based Access Control**: Dedicated dashboards and customized interfaces for Students and Wardens.
- **Complaints Management**: Students can raise issues, while Wardens can track, prioritize, and resolve them efficiently.
- **Leave Requests**: Automated system for submitting, reviewing, and approving/rejecting leave applications.
- **Night Attendance**: Wardens can quickly search, verify, and record daily night attendance with intelligent filtering.
- **Notice Board**: Instant announcements and urgent pinned notices managed by the administration.
- **Room Services**: Students can request maintenance or room services directly from their dashboard.
- **Visitor Logs**: Keep a secure track of visitor requests and approvals.
- **Account Management**: Self-service tools to change passwords or delete accounts securely.
- **Offline Capabilities**: Intelligent fallback caching using `localStorage` ensures the app remains functional and responsive even during network drops.

## Tech Stack
- **Frontend Core**: React.js (Vite), JavaScript (ES6+), JSX
- **Styling & UI**: Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons, Recharts
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **State Management**: React Context API, custom data hooks

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase Project configured with Authentication (Email/Password & Google) and Firestore Database.

### Installation
1. Navigate to the project directory:
   ```bash
   cd "HostelHub final project"
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production
To generate an optimized, production-ready bundle:
```bash
npm run build
```
The compiled files will be available in the `dist` directory.

## License
&copy; 2026 HostelHub Inc. All rights reserved.

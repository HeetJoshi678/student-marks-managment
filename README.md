# Student Marks Management System

A clean, modern, and production-ready **Student Marks Management System** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS 4.0**, and **Prisma ORM** with **SQLite**. 

This system features a secure, role-based authorization flow (via **NextAuth.js**) tailored for three distinct roles: Admin, Teacher, and Student, complete with analytical visualizations powered by **Recharts**.

---

## 🚀 Key Features

### 🔒 1. Secure Authentication & Route Control
*   **Role-Based Security**: Fully guarded routes managed via Next.js Proxy (`src/proxy.ts`). Accounts are segmented into **Admin**, **Teacher**, and **Student**.
*   **Safe Credentials Hashing**: Hashed credentials database checks using **Bcrypt**.
*   **Persistent Sessions**: Integrates Session Provider hooks to retrieve user credentials in Client components.

### 👤 2. Admin Workspace
*   **Administrative Dashboard**: Displays total registered students, active teaching staff, course subjects, and overall school average performance.
*   **Accounts Directory**: Complete searchable table listing user emails, registered roles, and profiles.
*   **Subjects Registry**: Pairings of subjects with their assigned instructors.

### 👩‍🏫 3. Teacher Workspace
*   **Context Control**: Filter student registries by Subject, Exam Type (e.g. Midterm, Final, Quizzes), and Term.
*   **Inline Grade Book**: Submit, update, or delete marks directly inside a responsive spreadsheet.
*   **Analytics Visualizer**: Compares class percentages and graphs class performance distribution instantly via a Recharts bar chart.
*   **Class Average Tracker**: Automatically tracks the class percentage average for the selected exam.

### 👨‍🎓 4. Student Workspace
*   **Official Academic Transcript**: View a categorized ledger of all recorded marks (Midterms, Finals) alongside calculated percentage values and letter grades (A, B, C, D, F).
*   **Visual Progress Chart**: Recharts dual-bar chart overlaying Midterm and Final percentages by subject.
*   **Projected GPA Goal Planner**: Interactive calculator tool to simulate hypothetical scores and see projected GPA outcomes in real-time.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.0, Lucide Icons.
*   **Backend**: Next.js Server Actions, NextAuth.js (Auth.js) credentials provider.
*   **Database**: Prisma ORM, SQLite (local database engine for offline capabilities).
*   **Analytics**: Recharts.

---

## 📦 Directory Structure

```text
student-marks-management/
├── prisma/
│   ├── schema.prisma         # Database models and relations
│   ├── seed.ts               # Local dummy accounts database seeder
│   └── dev.db                # Auto-generated SQLite database binary
├── src/
│   ├── app/
│   │   ├── (auth)/login      # Sleek sign-in screen
│   │   ├── actions/marks.ts  # Database mutation Server Actions
│   │   ├── api/auth/         # NextAuth routing catcher
│   │   ├── dashboard/        # Dashboards container
│   │   │   ├── admin/        # Admin control panels
│   │   │   ├── teacher/      # Teacher manual marks manager
│   │   │   └── student/      # Student grades card & GPA calculator
│   │   ├── layout.tsx        # Base styling and providers injection shell
│   │   └── page.tsx          # Initial entry route redirect
│   ├── components/           # Sidebar, header, and client dashboard widgets
│   ├── lib/                  # Database connections and authentication options
│   ├── proxy.ts              # Route protection and traversal protection
│   └── types/                # Session type configurations
├── .env                      # Local configuration files
└── package.json              # Script directives and node modules list
```

---

## 🏁 Quick Setup

Follow these steps to run the project locally on your machine:

### 1. Prerequisite
Ensure that **Node.js** (v20+) is installed.

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/HeetJoshi678/student-marks-managment.git
cd student-marks-managment
npm install
```

### 3. Initialize the Database
Configure the SQLite file-path variables and generate the Prisma Client:
```bash
npx prisma db push
```

### 4. Seed the Database
Pre-populate the database with sample administrators, instructors, classes, and marks records:
```bash
npx prisma db seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Seeding User Profiles (Default Accounts)

You can log in to the system using the following credentials:

| Dashboard View | Email Address | Password | Profile Detail |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | System Admin |
| **Teacher** | `teacher@school.com` | `teacher123` | Sarah Jenkins (Instructor for Mathematics & Science) |
| **Student (1)** | `student@school.com` | `student123` | Alex Rivera (Grade 10A, Roll No: `S202601`) |
| **Student (2)** | `student2@school.com` | `student123` | Emily Chen (Grade 10A, Roll No: `S202602`) |

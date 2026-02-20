# Teacher Directory Frontend (nuox-test)

This is a [Next.js](https://nextjs.org/) application built using the App Router, React Hook Form, Tailwind CSS v4, and Zod for the Teacher Directory management system.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- The backend server (`node-structure`) must be running on `http://localhost:4200` to interact with the API correctly.

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start the Development Server:**
```bash
npm run dev
```

3. **Access the Application:**
Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features and Usage

### Public Access
- **Home Page** (`/`): Landing page to navigate to the Teachers directory.
- **Teachers Directory** (`/teachers`): View all teachers. Includes filtering capabilities by the first letter of the last name and by subject. 
- **Teacher Profile** (`/teachers/[id]`): View detailed information about a specific teacher.

### Admin Access
- **Login** (`/login`): Log in using mock admin credentials to access protected features. 
  - **Email**: `admin@test.com`
  - **Password**: `123456`
- **Add Teacher** (`/teachers/new`): Once logged in, admins can add new teachers to the system using a validated form.
- **Edit Teacher** (`/teachers/[id]/edit`): Admins can edit teacher details.
- **Delete Teacher**: Available on the Teacher Profile page for admins.
- **Bulk Import**: (Feature placeholder/in-progress) A guarded button visible only to admins on the Teachers Directory page.

## 🛠️ Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **API Requests**: Axios (Base URL configured in `src/lib/api.ts`)

## 📁 Important Files

- `src/lib/api.ts` - Axios instance configured to point to the `http://localhost:4200/api` backend.
- `src/components/TeacherForm.tsx` - Reusable form component handling both Add and Edit actions with React Hook Form and Zod. 
- `src/app/teachers/page.tsx` - Main directory page with filtering logic and restricted admin actions.

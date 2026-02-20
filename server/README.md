# Teacher Directory Backend (node-structure)

A production-ready Express.js server setup with TypeScript and MySQL, providing APIs for the Teacher Directory application.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MySQL Server (running locally or remotely)

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Environment Variables:**
Copy the example environment file and update the variables.
```bash
cp .env.example .env
```
Ensure your `.env` contains the following variables tailored to your MySQL setup:
```env
PORT=4200
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=teacher_directory

# Admin Login Constants (Used for mocking login)
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=123456
JWT_SECRET=your_jwt_secret_key
```

3. **Database Initialization:**
The server will automatically connect to MySQL and initialize the `teachers` table when it starts up.

4. **Start the Development Server:**
```bash
npm run dev
```
The server will start on `http://localhost:4200` and watch for filesystem changes in the `server` directory.

## 🛠️ Available Scripts

- `npm run dev` - Start development server using nodemon and ts-node.
- `npm run build` - Build TypeScript files into the `dist` folder.
- `npm start` - Start production server (requires `npm run build` first).
- `npm run type-check` - Run TypeScript compiler to check for type errors without emitting files.

## 📝 Key API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticates admin and returns a JWT token.

### Teachers
- `GET /api/teachers` - Fetch all teachers (supports filtering by `lastNameStartsWith` and `subject`).
- `GET /api/teachers/:id` - Fetch a single teacher by ID.
- `POST /api/teachers` - Create a new teacher.
- `PUT /api/teachers/:id` - Update an existing teacher.
- `DELETE /api/teachers/:id` - Delete a teacher.

## 📁 Folder Structure
The source code is primarily located in the `server` directory.
- `server/index.ts` - Application entry point.
- `server/db.ts` - Database connection pool and initialization script.
- `server/routes/` - Express route definitions.
- `server/controllers/` - Route handlers wrapping database operations.

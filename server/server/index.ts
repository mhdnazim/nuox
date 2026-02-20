import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './db';
import teacherRoutes from './routes/teachers.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4200;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);

// Database and Server Startup
const startServer = async () => {
    await initializeDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌐 http://localhost:${PORT}`);
    });
};

startServer();

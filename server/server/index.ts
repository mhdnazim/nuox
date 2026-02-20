import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './db';
import teacherRoutes from './routes/teachers.routes';
import authRoutes from './routes/auth.routes';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4200;
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan('dev'));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Serve static files from the "public" directory
app.use("/uploads", express.static("public/uploads"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            success: false,
            message: 'CORS policy violation: Origin not allowed'
        });
        return;
    }

    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

const startServer = async () => {
    await initializeDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌐 http://localhost:${PORT}`);
    });
};

startServer();

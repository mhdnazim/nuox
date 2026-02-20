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

// Security and Logging Middleware
app.use(helmet());
app.use(morgan('dev'));

// Middleware
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];

const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or requests from the allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

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

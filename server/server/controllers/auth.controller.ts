import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const loginAdmin = (req: Request, res: Response): void => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
        res.status(500).json({ success: false, message: 'Server configuration error' });
        return;
    }

    if (email === adminEmail && password === adminPassword) {
        // Generate JWT token valid for 1 day
        const token = jwt.sign({ role: 'admin', email }, jwtSecret, { expiresIn: '1d' });
        res.status(200).json({ success: true, token, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

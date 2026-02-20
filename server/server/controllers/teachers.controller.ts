import { Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 1. Get all teachers
export const getTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lastNameStartsWith, subject } = req.query;

        let query = 'SELECT * FROM teachers WHERE 1=1';
        const queryParams: any[] = [];

        // Filter by first letter of last name
        if (lastNameStartsWith && typeof lastNameStartsWith === 'string') {
            // Must only be one letter
            const letter = lastNameStartsWith.charAt(0).toUpperCase();
            query += ` AND lastName LIKE ?`;
            queryParams.push(`${letter}%`);
        }

        // Filter by subject using JSON search
        if (subject && typeof subject === 'string') {
            // We look inside the JSON array field for the subject string
            query += ` AND JSON_CONTAINS(subjects, ?)`;
            queryParams.push(`"${subject}"`);
        }

        query += ' ORDER BY createdAt DESC';

        const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

        // Parse the JSON string back into an array for the client
        const formattedRows = rows.map(row => ({
            ...row,
            subjects: typeof row.subjects === 'string' ? JSON.parse(row.subjects) : row.subjects
        }));

        res.status(200).json({ success: true, count: formattedRows.length, data: formattedRows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching teachers' });
    }
};

// 2. Get a single teacher
export const getTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM teachers WHERE id = ?', [id]);

        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Teacher not found' });
            return;
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching teacher' });
    }
};

// 3. Create a new teacher
export const addTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, profilePicture, email, phone, roomNumber, subjects } = req.body;

        if (!firstName || !lastName || !email) {
            res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
            return;
        }

        let parsedSubjects: string[] = [];
        if (subjects) {
            if (!Array.isArray(subjects)) {
                res.status(400).json({ success: false, message: 'Subjects must be an array' });
                return;
            }
            if (subjects.length > 5) {
                res.status(400).json({ success: false, message: 'A teacher can teach no more than 5 subjects' });
                return;
            }
            parsedSubjects = subjects;
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO teachers (firstName, lastName, profilePicture, email, phone, roomNumber, subjects) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, profilePicture || null, email, phone || null, roomNumber || null, JSON.stringify(parsedSubjects)]
        );

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: { id: result.insertId, firstName, lastName, profilePicture, email, phone, roomNumber, subjects: parsedSubjects }
        });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }
        res.status(500).json({ success: false, message: error.message || 'Error creating teacher' });
    }
};

// 4. Update a teacher
export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { firstName, lastName, profilePicture, email, phone, roomNumber, subjects } = req.body;

        let subjectsParam = null;
        if (subjects !== undefined) {
            if (!Array.isArray(subjects)) {
                res.status(400).json({ success: false, message: 'Subjects must be an array' });
                return;
            }
            if (subjects.length > 5) {
                res.status(400).json({ success: false, message: 'A teacher can teach no more than 5 subjects' });
                return;
            }
            subjectsParam = JSON.stringify(subjects);
        }

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE teachers SET 
        firstName = COALESCE(?, firstName), 
        lastName = COALESCE(?, lastName), 
        profilePicture = COALESCE(?, profilePicture), 
        email = COALESCE(?, email), 
        phone = COALESCE(?, phone), 
        roomNumber = COALESCE(?, roomNumber), 
        subjects = COALESCE(?, subjects) 
      WHERE id = ?`,
            [firstName || null, lastName || null, profilePicture || null, email || null, phone || null, roomNumber || null, subjectsParam, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Teacher not found (or no changes made)' });
            return;
        }

        res.status(200).json({ success: true, message: 'Teacher updated successfully' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Email already in use by another teacher' });
            return;
        }
        res.status(500).json({ success: false, message: error.message || 'Error updating teacher' });
    }
};

// 5. Delete a teacher
export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>('DELETE FROM teachers WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Teacher not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting teacher' });
    }
};

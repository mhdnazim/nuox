import { Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

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

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4200';
        const finalProfilePicture = profilePicture ? (profilePicture.startsWith('http') ? profilePicture : `${backendUrl}${profilePicture}`) : null;

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO teachers (firstName, lastName, profilePicture, email, phone, roomNumber, subjects) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, finalProfilePicture, email, phone || null, roomNumber || null, JSON.stringify(parsedSubjects)]
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

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4200';
        const finalProfilePicture = profilePicture ? (profilePicture.startsWith('http') ? profilePicture : `${backendUrl}${profilePicture}`) : null;

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
            [firstName || null, lastName || null, finalProfilePicture, email || null, phone || null, roomNumber || null, subjectsParam, id]
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
// 6. Import teachers from CSV & ZIP
export const importTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        let csvBuffer: Buffer | null = files?.['csvData']?.[0]?.buffer || null;
        const zipFile = files?.['imagesZip']?.[0];

        if (!csvBuffer && !zipFile) {
            res.status(400).json({ success: false, message: 'Please provide at least a CSV file or a ZIP archive containing a CSV file.' });
            return;
        }

        const imageMap: { [filename: string]: Buffer } = {};
        if (zipFile) {
            try {
                const zip = new AdmZip(zipFile.buffer);
                const zipEntries = zip.getEntries();

                zipEntries.forEach((entry: any) => {
                    if (!entry.isDirectory) {
                        const filename = entry.name;
                        const data = entry.getData();
                        imageMap[filename] = data;

                        // If we don't have a CSV buffer yet, check if this is a CSV file
                        if (!csvBuffer && filename.toLowerCase().endsWith('.csv')) {
                            csvBuffer = data;
                        }
                    }
                });
            } catch (err) {
                console.error("Error parsing ZIP:", err);
            }
        }

        if (!csvBuffer) {
            res.status(400).json({ success: false, message: 'No CSV data found. Please provide a CSV file or a ZIP archive containing a CSV file.' });
            return;
        }

        // Parse CSV
        const csvString = csvBuffer.toString('utf-8');
        let recordsRaw = parse(csvString, {
            columns: false, // Parse as arrays first to find the header row
            skip_empty_lines: true,
            trim: true
        });

        if (recordsRaw.length === 0) {
            res.status(400).json({ success: false, message: 'CSV file is empty or invalid' });
            return;
        }

        // Find the header row (the first row that contains "email" or "first name")
        let headerRowIndex = -1;
        for (let i = 0; i < recordsRaw.length; i++) {
            const row = recordsRaw[i];
            const rowString = row.join(' ').toLowerCase();
            if (rowString.includes('email') || rowString.includes('first name') || rowString.includes('firstname')) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            res.status(400).json({ success: false, message: 'Could not find a valid header row in the CSV (e.g., "Email Address" or "First Name").' });
            return;
        }

        const headers = recordsRaw[headerRowIndex];
        const dataRows = recordsRaw.slice(headerRowIndex + 1);

        // Convert to objects using the discovered headers
        const records = dataRows.map((row: string[]) => {
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
                if (header) obj[header] = row[index];
            });
            return obj;
        });

        // Prepare upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const insertedTeachers = [];
            let duplicateEmails = 0;
            let skippedRows = 0;

            // Helper to get field value by multiple possible header names (case-insensitive)
            const getField = (record: any, aliases: string[]) => {
                const keys = Object.keys(record);
                for (const alias of aliases) {
                    const foundKey = keys.find(k => k.toLowerCase().trim() === alias.toLowerCase().trim());
                    if (foundKey) return record[foundKey];
                }
                return null;
            };

            for (const record of records as any[]) {
                const firstName = getField(record, ['firstName', 'First Name']);
                const lastName = getField(record, ['lastName', 'Last Name']);
                const email = getField(record, ['email', 'Email Address', 'Email']);
                const phone = getField(record, ['phone', 'Phone Number', 'Phone']);
                const roomNumber = getField(record, ['roomNumber', 'Room Number']);
                const subjectsRaw = getField(record, ['subjects', 'Subjects taught', 'Subjects']);

                if (!firstName || !lastName || !email) {
                    console.log(`⚠️ Skipping row due to missing required fields: firstName=${firstName}, lastName=${lastName}, email=${email}`);
                    skippedRows++;
                    continue;
                }

                let subjects: string[] = [];
                if (subjectsRaw) {
                    subjects = subjectsRaw.split(/[,|]/).map((s: string) => s.trim()).filter((s: string) => s);
                }

                if (subjects.length > 5) {
                    subjects = subjects.slice(0, 5); // Trim to max 5 subjects
                }

                // Profile Image Logic
                const baseUrl = process.env.BACKEND_URL || "http://localhost:4200";
                let finalProfilePicture = `${baseUrl}/uploads/placeholder.png`;
                let profilePictureFilename = getField(record, ['profilePicture', 'Profile Picture', 'Profile picture']);

                // if (profilePictureFilename && imageMap[profilePictureFilename]) {
                //     const ext = path.extname(profilePictureFilename);
                //     const safeFilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
                //     const targetPath = path.join(uploadDir, safeFilename);
                //     fs.writeFileSync(targetPath, imageMap[profilePictureFilename]);
                //     finalProfilePicture = `/uploads/profiles/${safeFilename}`;
                // }

                if (profilePictureFilename) {
                    const matchKey = Object.keys(imageMap).find(
                        k => k.toLowerCase() === profilePictureFilename.toLowerCase()
                    );

                    if (matchKey) {
                        const ext = path.extname(matchKey);
                        const safeFilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
                        const targetPath = path.join(uploadDir, safeFilename);
                        fs.writeFileSync(targetPath, imageMap[matchKey]);
                        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4200';
                        finalProfilePicture = `${backendUrl}/uploads/profiles/${safeFilename}`;
                    }
                }

                try {
                    const [result] = await connection.query<ResultSetHeader>(
                        'INSERT INTO teachers (firstName, lastName, profilePicture, email, phone, roomNumber, subjects) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [firstName, lastName, finalProfilePicture, email, phone || null, roomNumber || null, JSON.stringify(subjects)]
                    );
                    insertedTeachers.push({ id: result.insertId, email });
                } catch (dbErr: any) {
                    if (dbErr.code === 'ER_DUP_ENTRY') {
                        duplicateEmails++;
                    } else {
                        throw dbErr;
                    }
                }
            }

            await connection.commit();

            res.status(200).json({
                success: true,
                message: `Successfully imported ${insertedTeachers.length} teachers. Skipped ${duplicateEmails} duplicates and ${skippedRows} invalid rows.`,
                importedCount: insertedTeachers.length,
                duplicatesSkipped: duplicateEmails,
                skippedRows
            });
        } catch (txErr: any) {
            await connection.rollback();
            res.status(500).json({ success: false, message: 'Transaction failed: ' + txErr.message });
        } finally {
            connection.release();
        }

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error importing teachers' });
    }
};

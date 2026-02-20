import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'teacher_directory',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const initializeDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ MySQL Connected to ${process.env.DB_NAME}`);

        // Temporarily disable foreign key checks to drop the tables if they're referenced elsewhere
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS teacher_subjects'); // Clean up old junction table if it was created
        await connection.query('DROP TABLE IF EXISTS teachers');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create the updated teachers table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        profilePicture VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        roomNumber VARCHAR(50),
        subjects JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Teachers table ready');
        connection.release();
    } catch (error) {
        console.error('❌ Failed to connect to MySQL:', error);
        process.exit(1);
    }
};

export default pool;

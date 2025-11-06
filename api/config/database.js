import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'uvm_inventario',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a BD establecida');
        return connection;
    } catch (error) {
        console.error('❌ Error conectando a BD:', error);
        throw error;
    }
};

export default pool;
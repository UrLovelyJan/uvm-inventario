import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Conectado a la base de datos');

        // Hashear contraseñas
        const jefePassword = await bcrypt.hash('JefeUVM#2025', 10);
        const auxPassword = await bcrypt.hash('AuxUVM#2025', 10);

        // Insertar usuarios con contraseñas hasheadas
        await connection.execute(
            `INSERT IGNORE INTO Usuario (usuario, contraseña_hash, rol_id, nombre, email) 
             VALUES (?, ?, 1, 'Juan Carlos Mendoza', 'juan.mendoza@uvm.edu.mx')`,
            ['jefe_depto', jefePassword]
        );

        await connection.execute(
            `INSERT IGNORE INTO Usuario (usuario, contraseña_hash, rol_id, nombre, email) 
             VALUES (?, ?, 2, 'María Elena Ruiz', 'maria.ruiz@uvm.edu.mx')`,
            ['aux_labs', auxPassword]
        );

        console.log('Usuarios de prueba insertados correctamente');
        console.log('Jefe de Departamento: jefe_depto / JefeUVM#2025');
        console.log('Auxiliar: aux_labs / AuxUVM#2025');

    } catch (error) {
        console.error('Error en el seed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seedDatabase();
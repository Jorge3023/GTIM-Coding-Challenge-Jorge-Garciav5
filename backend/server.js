// Cargar variables de entorno desde .env
require('dotenv').config(); 
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Elige un puerto diferente al de tu frontend (ej: 8080)

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Esto permite que tu frontend (que estará en otra dirección/puerto) pueda comunicarse
app.use(cors()); 
// Middleware para parsear JSON en las peticiones (ej: para recibir los datos de registro/login)
app.use(express.json());

// --- Configuración de la Conexión a PostgreSQL ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Puedes añadir SSL si lo usas en producción
});

// Prueba de conexión (opcional pero útil)
pool.on('connect', () => {
    console.log('✅ Conexión exitosa a PostgreSQL');
});
pool.on('error', (err) => {
    console.error('❌ Error de conexión con PostgreSQL:', err);
});

// --- Rutas de la API (Aquí irán Registro y Login) ---
// Ejemplo de ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor de autenticación funcionando');
});

// ********** [Aquí agregaremos las rutas en los siguientes pasos] **********

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

// Exportar el pool para usarlo en otros archivos si fuese necesario
module.exports = { pool };


const bcrypt = require('bcryptjs'); // Asegúrate de que esta línea esté al inicio si no lo está
const SALT_ROUNDS = 10; // Nivel de seguridad para bcrypt

// Función de validación de contraseña (Criterio US01)
const isPasswordValid = (password) => {
    // Debe tener al menos 8 caracteres
    if (password.length < 8) return false;
    // Debe tener al menos un número (/\d/)
    if (!/\d/.test(password)) return false;
    // Debe tener al menos una letra (/[a-zA-Z]/)
    if (!/[a-zA-Z]/.test(password)) return false;
    return true;
};


// --- US01: Ruta de Registro de Usuario ---
app.post('/api/signup', async (req, res) => {
    const { email, password, fullName } = req.body;

    // 1. Validaciones de Datos (Criterios US01)
    if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // 1.1. Validar Longitud del Nombre
    if (fullName.length < 5) {
        return res.status(400).json({ success: false, message: 'El nombre completo debe tener al menos 5 caracteres.' });
    }

    // 1.2. Validar Contraseña
    if (!isPasswordValid(password)) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres, un número y una letra.' });
    }
    
    // 2. Encriptar Contraseña (Punto a favor US01)
    let passwordHash;
    try {
        passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor al procesar la contraseña.' });
    }

    // 3. Almacenar en la Base de Datos (Criterio US01)
    const query = `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    
    try {
        await pool.query(query, [email, passwordHash, fullName]);
        
        // Criterio: Mensaje de registro exitoso
        res.status(201).json({ 
            success: true, 
            message: '✅ Registro exitoso. ¡Ahora puedes iniciar sesión!' 
        });

    } catch (error) {
        // Manejar el caso de correo electrónico duplicado (UNIQUE constraint)
        if (error.code === '23505' && error.constraint === 'users_email_key') {
             return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }
        console.error('Error al insertar el usuario:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al registrar el usuario.' });
    }
});

// --- US02: Ruta de Inicio de Sesión ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Correo electrónico y contraseña son obligatorios.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 1. Verificar Bloqueo (Criterio US02)
        if (user.is_locked && user.lock_until && new Date() < new Date(user.lock_until)) {
            const unlockTime = new Date(user.lock_until).toLocaleTimeString();
            return res.status(403).json({ success: false, message: `Tu cuenta está bloqueada hasta las ${unlockTime}.` });
        }
        
        // 2. Comparar Contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            // A. Inicio de Sesión Exitoso
            
            // 2.1. Resetear el contador de intentos fallidos
            await pool.query('UPDATE users SET failed_attempts = 0, is_locked = FALSE, lock_until = NULL WHERE email = $1', [email]);

            // Criterio: Mensaje de Bienvenida y Nombre Completo
            // **Nota sobre Sesiones:** Por simplicidad, aquí se usa el nombre completo.
            // Para "asegurar que haya solo una sesión activa" (US02), DEBERÍAS usar tokens JWT o sesiones en el backend.
            // Esto es un punto a implementar después para cumplir el criterio de forma robusta.
            
            res.status(200).json({ 
                success: true, 
                message: `Bienvenido ${user.full_name}! Para cerrar sesión haga clic aquí`,
                fullName: user.full_name, // Se envía el nombre para que el frontend lo use
                // Aquí deberías generar y enviar un token JWT si usas autenticación moderna
            });

        } else {
            // B. Contraseña Incorrecta
            let newAttempts = user.failed_attempts + 1;
            let lockUntil = null;
            let isLocked = false;
            let message = 'Credenciales inválidas. Intento fallido.';

            // 2.2. Manejo de Bloqueo (Criterio US02: 3 intentos)
            if (newAttempts >= 3) {
                // Bloquear por 2 horas (120 minutos * 60 segundos * 1000 milisegundos)
                lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); 
                isLocked = true;
                newAttempts = 0; // Se resetea para el próximo ciclo de bloqueo
                message = `¡Tercer intento fallido! Tu cuenta ha sido bloqueada por 2 horas hasta las ${lockUntil.toLocaleTimeString()}.`;
            } else {
                message += ` Te quedan ${3 - newAttempts} intentos.`;
            }

            // 2.3. Actualizar intentos en la BD
            await pool.query(
                'UPDATE users SET failed_attempts = $1, is_locked = $2, lock_until = $3 WHERE email = $4',
                [newAttempts, isLocked, lockUntil, email]
            );

            res.status(401).json({ success: false, message });
        }

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});


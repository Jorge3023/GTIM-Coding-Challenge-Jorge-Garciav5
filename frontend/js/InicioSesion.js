// js/InicioSesion.js

document.addEventListener('DOMContentLoaded', () => {
    // Asume que el formulario de login tiene el ID 'login-form'
    const form = document.getElementById('login-form'); 
    
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Detiene el envío estándar del formulario
            
            // Asume que los inputs de login tienen IDs 'login-email' y 'login-password'
            const email = document.getElementById('login-email').value; 
            const password = document.getElementById('login-password').value;
            const API_URL = 'http://localhost:3000'; 

            try {
                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (data.success) {
                    // **Criterio US02:** Mostrar mensaje de Bienvenida y enlace para cerrar sesión.
                    
                    // Modificamos el mensaje para insertar el enlace
                    const welcomeMessageHTML = data.message.replace(
                        'haga clic aquí', 
                        // El enlace cerrará la sesión. En una app real, aquí se usaría un token.
                        '<a href="#" id="logout-link" style="color: blue; text-decoration: underline;">aquí</a>' 
                    );
                    
                    // Mostrar el mensaje en la página (puedes adaptarlo para mostrarlo en un div específico)
                    alert(`Bienvenido : ${data.fullName}`);
                    
                    // Por ahora, redirigimos a una página de 'bienvenida' o la página principal
                    // En el mundo real, se guardaría el 'fullName' o un token en el almacenamiento local.
                    
                    localStorage.setItem('userFullName', data.fullName);
                    window.location.href = '../Index.html'; // Redirige a la página principal
                    
                } else {
                    // Manejo de errores de credenciales o bloqueo
                    alert('Error en el inicio de sesión: ' + data.message);
                }

            } catch (error) {
                console.error('Error de red/servidor:', error);
                alert('No se pudo conectar con el servidor.');
            }
            // ... (dentro de InicioSesion.js, en la parte de data.success) ...

if (data.success) {    
    localStorage.setItem('userFullName', data.fullName); 
    
    window.location.href = '../Index.html'; // Redirige a la página principal
    
} else {
    // Manejo de errores de credenciales o bloqueo
    alert('Error en el inicio de sesión: ' + data.message);
}
        });
    }
    
});


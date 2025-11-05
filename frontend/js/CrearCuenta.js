// Asegúrate de que este script se ejecute cuando el formulario se envíe.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form'); // Asume un ID en tu formulario
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita la recarga de la página

            const email = document.getElementById('email').value; // Asume IDs en tus inputs
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName').value;
            const API_URL = 'http://localhost:3000'; // **ADAPTAR AL PUERTO DE TU BACKEND**

            try {
                const response = await fetch(`${API_URL}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, fullName }),
                });

                const data = await response.json();

                if (data.success) {
                    // Criterio: Mostrar mensaje de registro exitoso.
                    alert(data.message); 
                    // Opcional: Redirigir a la página de login
                    window.location.href = './public/InicioSesion.html'; 
                } else {
                    alert('Error en el registro: ' + data.message);
                }

            } catch (error) {
                console.error('Error de red/servidor:', error);
                alert('No se pudo conectar con el servidor. Intente más tarde.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    const fullName = localStorage.getItem('userFullName');
    const profileNameElement = document.getElementById('profileName');
    const welcomeContainer = document.getElementById('welcomeMessageContainer');
    const logoutLinkElement = document.getElementById('logoutLink');
    const loginPage = './InicioSesion.html'; // Tu página de inicio de sesión

    // 1. Verificar sesión activa
    if (!fullName) {
        // Si no hay nombre en el almacenamiento local, redirigir a login.
        // Esto previene que usuarios no autenticados vean la página.
        window.location.href = loginPage;
        return; 
    }

    // 2. Mostrar Nombre en el Perfil (US02)
    if (profileNameElement) {
        profileNameElement.textContent = fullName;
    }

    // 3. Mostrar el Mensaje de Bienvenida Completo (US02)
    // Criterio: "Bienvenido <Nombre Completo>! Para cerrar sesión haga clic aquí"
    if (welcomeContainer) {
        // En este caso, usaremos el enlace de la barra lateral, pero si necesitas
        // mostrarlo como texto en la cabecera:
        const welcomeMessage = `Bienvenido ${fullName}! Para cerrar sesión haga clic `;
        
        // Creamos un <span> o <p> para el texto y lo inyectamos
        const messageElement = document.createElement('p');
        messageElement.innerHTML = welcomeMessage + `<a href="#" id="headerLogoutLink">aquí</a>.`;
        welcomeContainer.appendChild(messageElement);
        
        // Agregar el listener al nuevo enlace creado si es necesario
        const headerLogoutLink = document.getElementById('headerLogoutLink');
        if (headerLogoutLink) {
            headerLogoutLink.addEventListener('click', handleLogout);
        }
    }


    // 4. Implementar Cierre de Sesión (US02)
    function handleLogout(event) {
        event.preventDefault();
        
        // Aquí deberías enviar una petición al servidor para invalidar el token/sesión 
        // si estuvieras usando un sistema de sesión más avanzado.
        // Por ahora, solo limpiamos el almacenamiento local.
        
        localStorage.removeItem('userFullName');
        
        // Redirigir al usuario
        alert('Sesión cerrada exitosamente.');
        window.location.href = loginPage;
    }

    // Añadir el listener al enlace de la barra lateral
    if (logoutLinkElement) {
        logoutLinkElement.addEventListener('click', handleLogout);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const profileImage = document.getElementById('profileImage');
    const userId = 1; // Cambia esto al ID del usuario actual

    // Función para obtener la imagen de perfil del servidor
    function fetchProfileImage() {
        fetch('getProfileImage.php?user_id=' + userId)
        .then(response => response.json())
        .then(data => {
            profileImage.src = data.image_path || 'default-avatar.png';
        })
        .catch(error => console.error('Error:', error));
    }

    // Cargar la imagen de perfil al inicio
    fetchProfileImage();
});

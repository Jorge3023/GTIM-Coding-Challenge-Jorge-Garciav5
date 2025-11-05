document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');

    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        fetch('subiryactualizarfoto.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            fetchProfileImage(); // Actualiza la imagen después de subir
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al subir la imagen.');
        });
    });

    function fetchProfileImage() {
        fetch('obtenerimagen.php')
        .then(response => response.json())
        .then(image => {
            const profileImageContainer = document.getElementById('profileImageContainer');
            profileImageContainer.innerHTML = ''; // Limpiar imagen existente

            if (image && image.image_path) {
                const img = document.createElement('img');
                img.src = 'uploads/' + image.image_path;
                img.alt = 'Foto de perfil';
                profileImageContainer.appendChild(img);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Llamar a la función para mostrar la imagen cuando la página se cargue
    fetchProfileImage();
});

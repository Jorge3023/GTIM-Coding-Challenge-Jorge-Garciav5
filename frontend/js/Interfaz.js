document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskLink = document.getElementById('addTaskLink');
    const taskModal = document.getElementById('taskModal');
    const editModal = document.getElementById('editModal');
    const closeBtns = document.querySelectorAll('.close');
    const taskForm = document.getElementById('taskForm');
    const editForm = document.getElementById('editForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const logoutLink = document.getElementById('logoutLink');
    const profileName = document.getElementById('profileName'); // Elemento para mostrar el nombre del usuario

    // Función para obtener y mostrar el perfil del usuario
    function fetchAndDisplayProfile() {
        fetch('Interfaz.php?action=getProfile') // Solicitud GET sin cuerpo
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                profileName.textContent = `${data.nombre} ${data.apellido}`;
            } else {
                console.error('Error al obtener el perfil del usuario:', data.message);
            }
        })
        .catch(error => console.error('Error al cargar el perfil:', error));
    }

    addTaskBtn.addEventListener('click', function() {
        taskModal.style.display = 'block';
    });

    addTaskLink.addEventListener('click', function() {
        taskModal.style.display = 'block';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            taskModal.style.display = 'none';
            editModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const taskDate = document.getElementById('taskDate').value;
        const taskTime = document.getElementById('taskTime').value;

        fetch('Interfaz.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'add',
                taskName: taskName,
                taskDate: taskDate,
                taskTime: taskTime,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Actividad agregada correctamente.');
                fetchAndDisplayTasks();
            } else {
                alert(data.message);
            }
            taskForm.reset();
            taskModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar la actividad.');
        });
    });

    tasksContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const taskId = event.target.dataset.taskId;

            if (confirm('¿Está seguro de eliminar esta actividad?')) {
                fetch('Interfaz.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'delete',
                        id: taskId,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        fetchAndDisplayTasks();
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al eliminar la actividad.');
                });
            }
        } else if (event.target.classList.contains('edit-btn')) {
            const taskId = event.target.dataset.taskId;
            fetch('Interfaz.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get',
                    id: taskId,
                }),
            })
            .then(response => response.json())
            .then(task => {
                if (task.status === 'success') {
                    document.getElementById('editTaskId').value = task.id;
                    document.getElementById('editTaskName').value = task.nombre;
                    document.getElementById('editTaskDate').value = task.fecha;
                    document.getElementById('editTaskTime').value = task.hora;
                    editModal.style.display = 'block';
                } else {
                    alert('Error al cargar la actividad.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar la actividad.');
            });
        }
    });

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const taskId = document.getElementById('editTaskId').value;
        const taskName = document.getElementById('editTaskName').value;
        const taskDate = document.getElementById('editTaskDate').value;
        const taskTime = document.getElementById('editTaskTime').value;

        fetch('Interfaz.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'edit',
                id: taskId,
                newDescription: taskName,
                newDate: taskDate,
                newTime: taskTime,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Actividad actualizada correctamente.');
                fetchAndDisplayTasks();
            } else {
                alert(data.message);
            }
            editForm.reset();
            editModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al editar la actividad.');
        });
    });

    logoutLink.addEventListener('click', function(event) {
        event.preventDefault();
        if (confirm('¿Deseas cerrar sesión?')) {
            fetch('Interfaz.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'logout',
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    window.location.href = 'InicioSesion.html';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cerrar sesión.');
            });
        }
    });

    function fetchAndDisplayTasks() {
        fetch('Interfaz.php?action=fetch')
        .then(response => response.json())
        .then(tasks => {
            tasksContainer.innerHTML = '';
            let currentDate = '';
            tasks.forEach(task => {
                const taskTime = task.hora.split(':').slice(0, 2).join(':');

                if (task.fecha !== currentDate) {
                    currentDate = task.fecha;
                    const dateHeader = document.createElement('h3');
                    dateHeader.classList.add('task-date');
                    const dateParts = currentDate.split('-');
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    dateHeader.textContent = formattedDate;
                    const taskContainer = document.createElement('div');
                    taskContainer.classList.add('task-container');
                    taskContainer.appendChild(dateHeader);
                    tasksContainer.appendChild(taskContainer);
                }
                
                const taskItem = document.createElement('div');
                taskItem.classList.add('task');
                taskItem.innerHTML = `
                    <button class="edit-btn" data-task-id="${task.id}">✎</button>
                    <a href="#">${task.nombre}</a>
                    <span class="task-time">${taskTime}</span>
                    <button class="delete-btn" data-task-id="${task.id}">×</button>
                `;
                tasksContainer.lastElementChild.appendChild(taskItem);
            });
        })
        .catch(error => console.error('Error al cargar actividades:', error));
    }

    
    document.addEventListener('DOMContentLoaded', function() {
        const profileImage = document.getElementById('profileImage');
        const userId = 1; // Cambia esto al ID del usuario actual
    
        // Función para actualizar la imagen de perfil
        function updateProfileImage() {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('profile_image', document.querySelector('input[name="profile_image"]').files[0]);
    
            fetch('ActualizarFoto.php', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.text())
            .then(result => {
                console.log(result);
                // Actualiza la imagen en la interfaz después de una carga exitosa
                fetchProfileImage(); // Llama a la función para actualizar la imagen
            })
            .catch(error => console.error('Error:', error));
        }
    
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
    
        // Evento para manejar el formulario de carga de imagen
        document.querySelector('form').addEventListener('submit', function(event) {
            event.preventDefault();
            updateProfileImage();
        });
    });
    

    
    // Reestablecer el comportamiento para hacer clic en el nombre del perfil
    profileName.addEventListener('click', function() {
        window.location.href = 'cambiarfoto.php'; // Cambiar al nombre correcto del archivo PHP para cambiar la foto de perfil
    });

    // Llamar a la función para mostrar el perfil y las tareas cuando la página se cargue
    fetchAndDisplayProfile();
    fetchAndDisplayTasks();
});

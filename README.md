REMIND: Sistema de Autenticación y Gestión de Actividades (V5 - Inicio De Sesion)


💻 Tecnologías Utilizadas

| **Frontend** | HTML5, CSS3, JavaScript | Interfaz de Usuario y manejo de peticiones `fetch`. |

| **Backend** | Node.js, Express.js | Servidor API para manejar la lógica de negocio y la conexión a la DB. |

| **Base de Datos** | PostgreSQL | Almacenamiento persistente y seguro de usuarios y actividades. |

| **Seguridad** | `bcryptjs` | Encriptación de contraseñas (Hashing). |

---

📋 Requisitos del Proyecto

US01: Registro de Usuario (User Signup)

**Datos mínimos:** Correo electrónico, contraseña y nombre completo.
**Validaciones:** Contraseña (mín. 8 caracteres, 1 número, 1 letra) y Nombre completo (mín. 5 caracteres).
**Seguridad:** El correo electrónico es el identificador único. La contraseña se almacena **encriptada** con `bcrypt`.

US02: Inicio de Sesión de Usuario (User Login)

**Bloqueo:** Bloqueo de la cuenta por 2 horas tras 3 intentos fallidos consecutivos.
**Mensaje de Bienvenida:** Muestra "Bienvenido <Nombre Completo>! Para cerrar sesión haga clic aquí".
**Cierre de Sesión:** Manejo básico de la sesión y enlace funcional para cerrar sesión.



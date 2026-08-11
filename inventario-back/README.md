# Sistema de Inventario 

Sistema web Multi-Tenant diseñado para la gestión integral, trazabilidad y auditoría de activos informáticos. Permite administrar la estructura orgánica (Cargos, Destinos, Departamentos y Divisiones) garantizando el aislamiento total de los datos según el cargo del usuario responsable.

## 🚀 Características Principales

* **Arquitectura Multi-Tenant:** Aislamiento de datos por "Cargo" mediante tokens JWT. Un usuario solo tiene acceso al inventario de su propio cargo / destino.
* **Gestión Jerárquica:** Administración de Destinos, Departamentos y Divisiones.
* **Trazabilidad y Auditoría:** Registro automático (hoja de vida) de cualquier modificación de hardware o reasignación de equipos.
* **Generación de Etiquetas QR:** Creación automática de códigos QR en Base64 para el etiquetado físico de los activos.
* **Reportes Dinámicos:** Exportación del inventario completo a Excel (`.xlsx`), agrupando automáticamente los equipos en pestañas separadas según su Destino.
* **Soft Deletes:** Baja lógica de registros para mantener la integridad de la base de datos histórica.

## 🛠️ Stack Tecnológico

**Backend (API REST):**
* Node.js con Express
* TypeScript
* Prisma ORM
* PostgreSQL (Hosteado en Supabase/Render)
* JSON Web Tokens (JWT) & Bcrypt (Seguridad)
* ExcelJS & QRCode (Utilidades)

**Frontend:**
* React + TypeScript
* Vite
* Tailwind CSS v4
* Axios (Interceptors para Auth)
* React Router DOM

## ⚙️ Instalación y Ejecución Local

El proyecto está dividido en dos directorios principales: `inventario` (Backend) e `inventario-front` (Frontend).

### 1. Configurar el Backend
```bash
cd inventario
npm install

Crear un archivo .env en la raíz del backend con:
DATABASE_URL="tu_url_de_postgresql"
DIRECT_URL="tu_url_directa_de_postgresql"
JWT_SECRET="tu_clave_secreta"
PORT=3000

Sincronizar la base de datos y levantar el servidor:
npx prisma db push
npm run dev

2. Configurar el Frontend
En una nueva terminal:

cd inventario-front
npm install

Crear un archivo .env en la raíz del frontend con:
VITE_API_URL=http://localhost:3000/api

Levantar el entorno de desarrollo:
npm run dev
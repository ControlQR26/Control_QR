# 🎓 ControlQR — Sistema de Control de Ingreso y Carnetización Estudiantil

<div align="center">

![ControlQR Banner](https://img.shields.io/badge/ControlQR-Sistema%20Escolar-059669?style=for-the-badge&logo=school)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**Solución web integral para la gestión, emisión de carnets digitales y control de acceso en tiempo real de estudiantes en instituciones educativas.**

[🚀 Características](#-características-principales) • [🏗️ Arquitectura](#️-arquitectura-del-sistema) • [💻 Instalación](#-instalación-y-ejecución-local) • [🔑 Credenciales](#-credenciales-de-acceso-por-defecto) • [📱 Módulos](#-módulos-del-sistema)

</div>

---

## 📌 Resumen del Proyecto

**ControlQR** automatiza el registro de ingresos y salidas de los estudiantes mediante la lectura de códigos QR inteligentes generados e integrados en carnets estudiantiles (impresos o digitales). 

El sistema cuenta con un panel administrativo de métricas en tiempo real (KPIs), módulo de notificaciones instantáneas para acudientes/guardianes, generador y personalizador de carnets escolares en alta resolución (PDF / PNG), y gestión académica integral de matrículas, cursos y docentes.

---

## ✨ Características Principales

- 📷 **Escáner QR en Tiempo Real:** Compatible con cámaras web, smartphones o lectores de códigos de barras/QR físicos.
- 🎴 **Generador de Carnets Escolares:** Diseño personalizable con preview en vivo, exportación individual y por lotes en formatos PDF, PNG y JPG.
- ⚡ **Notificaciones a Acudientes:** Registro inmediato con fecha/hora y canal de alerta a tutores (Telegram / Email).
- 📊 **Panel de Control & Métricas (KPIs):** Estadísticas en vivo de aforo, ingresos puntuales, retardos y ausencias.
- 👥 **Gestión Completa de Estudiantes y Acudientes:** CRUD intuitivo con búsqueda rápida, filtros y vinculación familiar.
- 📚 **Gestión Académica:** Registro de grados, asignaturas, horarios y docentes encargados.
- 🔐 **Autenticación Segura:** Sesiones protegidas mediante NextAuth.js y control de roles.

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TD
    Root["📁 Control_QR"]
    Root --> Frontend["📁 frontend (Next.js 14 App Router + TailwindCSS)"]
    Root --> Backend["📁 backend (Node.js + Express + TypeScript)"]
    Root --> Database[("🗄️ MongoDB / Persistencia Local")]

    Frontend --> F_Auth["🔐 Autenticación (NextAuth)"]
    Frontend --> F_Dashboard["📊 Dashboard & Métricas"]
    Frontend --> F_Scanner["📷 Escáner QR de Acceso"]
    Frontend --> F_Cards["🎴 Generador y Exportador de Carnets"]
    Frontend --> F_Students["👥 Gestión de Estudiantes"]

    Backend --> B_Routes["🌐 API REST Endpoints"]
    Backend --> B_Controllers["⚙️ Controladores de Negocio"]
    Backend --> B_Models["📦 Modelos Mongoose"]
```

---

## 🗄️ Modelo de Datos (Diagrama ER)

```mermaid
erDiagram
    USER ||--o{ ACCESS_LOG : "supervisa"
    STUDENT ||--|| GUARDIAN : "acudiente principal"
    STUDENT ||--o{ ACCESS_LOG : "registra acceso"
    TEACHER ||--o{ SUBJECT : "imparte"
    SUBJECT ||--o{ SCHEDULE : "programa horario"
    STUDENT }|--|| SUBJECT : "cursa"

    USER {
        string _id PK
        string name
        string email
        string password
        string role
    }

    STUDENT {
        string _id PK
        string nombres
        string apellidos
        string numeroDocumento
        string codigoEstudiantil
        string programaAcademico
        string estado
        string qrCode
        string guardianId FK
    }

    GUARDIAN {
        string _id PK
        string nombreCompleto
        string parentesco
        string correo
        string telefono
        string telegramChatId
    }

    ACCESS_LOG {
        string _id PK
        string studentId FK
        datetime fechaHora
        string tipoEntrada
        string estadoAcceso
    }
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Backend** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Base de Datos** | [MongoDB](https://www.mongodb.com/) con Mongoose ODM |
| **Librerías Clave** | `html-to-image`, `jspdf`, `qrcode`, `bcryptjs`, `next-auth` |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Instancia de MongoDB local o URI de MongoDB Atlas

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Control_QR.git
cd Control_QR
```

### 2. Configurar y Ejecutar el Frontend
```bash
cd frontend
npm install
npm run dev
```
El cliente web estará disponible en: `http://localhost:3000`

### 3. Configurar y Ejecutar el Backend
```bash
cd ../backend
npm install
npm run dev
```
El servidor backend se ejecutará en: `http://localhost:5000`

---

## 🔑 Credenciales de Acceso por Defecto

Para ingresar al panel administrativo en desarrollo:

- **Usuario / Email:** `Administrador` (o `admin@controlqr.edu`)
- **Contraseña:** `admin123`

---

## 📱 Módulos del Sistema

1. **Panel Principal (Dashboard):** Visión global del estado del colegio, entradas del día y alertas de retardos.
2. **Escáner de Acceso:** Escaneo instantáneo de carnets QR para validar entrada/salida y notificar a los padres.
3. **Diseñador de Carnets:** Editor visual de carnets escolares con vista previa y descarga individual o masiva en PDF/PNG.
4. **Directorio de Estudiantes:** Registro, edición, filtros y generación automática de códigos QR.
5. **Historial y Reportes:** Registro detallado de accesos con filtros por fecha, grado y estado.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

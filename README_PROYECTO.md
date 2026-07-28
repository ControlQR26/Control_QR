# ControlQR — Sistema de Control de Ingreso Estudiantil

**ControlQR** es una solución web integral diseñada para la gestión, emisión de carnets digitales y control de acceso en tiempo real de estudiantes en instituciones educativas y colegios.

---

## 📌 Resumen del Proyecto

El sistema automatiza el registro de ingresos de los estudiantes mediante la lectura de códigos QR dinámicos impresos o desplegados en carnets digitales. Incluye notificaciones a acudientes/guardianes (vía Telegram/Email), un panel administrativo de métricas (KPIs), gestión de matrículas, docentes y generación masiva o individual de carnets.

---

## 🎨 Paleta de Diseño y Estilo Visual

- **Estilo:** Moderno, académico y profesional (Dashboard Administrativo).
- **Colores Institucionales:** Paleta escolar basada en tonos verde (Emerald/Lime), amarillo institucional y blanco con acabados limpios.
- **Interfaz:** Responsive, bordes redondeados suavemente, sombreados sutiles, micro-animaciones y tarjetas interactivo-visuales.

---

## 🏗️ Estructura del Proyecto

```mermaid
graph TD
    Root["Control_QR (Raíz)"]
    Root --> Backend["📁 backend (Express API & Database)"]
    Root --> Frontend["📁 frontend (Next.js 14 App Router)"]
    Root --> MockDB["📄 mock_db.json (Persistencia Local JSON)"]

    Backend --> B_Controllers["controllers/ (Auth, Students, Access, etc.)"]
    Backend --> B_Models["models/ (User, Student, Guardian, AccessLog)"]
    Backend --> B_Routes["routes.ts & server.ts"]

    Frontend --> F_App["app/"]
    F_App --> F_Auth["(auth)/login (Módulo de Autenticación)"]
    F_App --> F_Dash["(dashboard)/ (Dashboard, Estudiantes, Escáner, Carnets)"]
    F_App --> F_API["api/auth/[...nextauth] (NextAuth handler)"]
    Frontend --> F_Comp["components/ (CardPreview, QRScanner, UI)"]
    Frontend --> F_Lib["lib/ (auth.ts, db.ts)"]
```

---

## 🗄️ Esquema de Base de Datos (Modelo Entidad-Relación)

```mermaid
erDiagram
    USER ||--o{ ACCESS_LOG : "registra"
    STUDENT ||--|| GUARDIAN : "pertenece a"
    STUDENT ||--o{ ACCESS_LOG : "genera"
    TEACHER ||--o{ SUBJECT : "imparte"
    SUBJECT ||--o{ SCHEDULE : "programa"
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

## 🖥️ Mapa de Interfaz y Navegación de Usuario

```mermaid
graph LR
    subgraph Acceso
        L[🔐 Login Page]
    end

    subgraph Dashboard Admin
        D[📊 Panel Principal KPIs]
        E[👥 Gestión de Estudiantes]
        C[🎴 Generador de Carnets Escolares]
        S[📷 Escáner de Acceso QR]
        R[📜 Reportes e Historial]
    end

    L -->|Autenticación Correcta| D
    D --> E
    D --> C
    D --> S
    D --> R

    C -->|Exportar| EXP[PDF / PNG / Lote]
    S -->|Lectura QR| NOTIF[⚡ Notificación Acudiente]
```

---

## 🚀 Arquitectura y Tecnologías

### Frontend & UI
- **Framework:** Next.js (App Router, React, TypeScript).
- **Estilos:** TailwindCSS (con variaciones dinámicas de verde institucional escolar).
- **Iconografía:** Lucide React.
- **Generación de Carnets y Exportación:** QRCode, `html-to-image`, `jspdf`.
- **Autenticación:** NextAuth.js (Gestión de sesiones seguras mediante credenciales de Administrador).

### Backend & Almacenamiento
- **Servidor:** Node.js + Express (TypeScript).
- **Base de Datos:** MongoDB con ODM Mongoose / Fallback de persistencia ligera JSON (`mock_db.json`).
- **Seguridad:** Encriptación de contraseñas con bcryptjs.

---

## 📂 Módulos y Funcionalidades Principales

### 1. Autenticación y Seguridad
- Iniciar / Cerrar sesión para el **Administrador** del sistema.
- Rutas privadas protegidas por NextAuth middleware.

### 2. Dashboard General (Métricas en Tiempo Real)
- Tarjetas de KPIs (Total estudiantes, accesos del día, ingresos a tiempo, retardos).
- Gráficos de flujo de ingresos y lista de actividad reciente.

### 3. Registro y Escáner de Acceso QR
- Lector de código QR en tiempo real desde la cámara web o escáner de mano.
- Verificación automática de estado del estudiante (Activo/Inactivo).
- Notificación automática instantánea a acudientes registrando fecha y hora exacta.

### 4. Generador de Carnet Digital Escolar
- Generación de carnet digital escolar.
- Código QR único integrado por estudiante.
- Panel de personalización en tiempo real (colores, logo, campos visibles).
- Exportación a **PNG, JPG y PDF**, con opción de generación en lote (masiva).

### 5. Gestión de Estudiantes y Acudientes (CRUD)
- Registro completo de estudiantes (Nombres, Documento, Código, Grado/Programa Escolar, Estado).
- Vinculación con Acudientes/Guardians y canales de contacto.

### 6. Gestión Académica (Docentes, Asignaturas y Horarios)
- Control de cursos/grados escolares, materias asignadas, docentes y horarios lectivos.

---

## 🗝️ Credenciales de Acceso por Defecto

- **Usuario:** `Administrador`
- **Contraseña:** `admin123`

---

## 🛠️ Ejecución Local

### 1. Iniciar el Frontend (Next.js)
```bash
cd frontend
npm run dev
```

### 2. Iniciar el Backend (Express)
```bash
cd backend
npm run dev
```

# 📘 Manual de Usuario — ControlQR

**Sistema de Control de Ingreso Estudiantil con QR y Notificaciones**

> Versión 1.0.0 | Última actualización: Julio 2026

---

## 📑 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Inicio del Sistema](#4-inicio-del-sistema)
5. [Acceso al Sistema (Login)](#5-acceso-al-sistema-login)
6. [Navegación General](#6-navegación-general)
7. [Módulos del Sistema](#7-módulos-del-sistema)
   - 7.1 [Dashboard Principal](#71-dashboard-principal)
   - 7.2 [Gestión de Estudiantes](#72-gestión-de-estudiantes)
   - 7.3 [Gestión de Acudientes](#73-gestión-de-acudientes)
   - 7.4 [Gestión de Docentes](#74-gestión-de-docentes)
   - 7.5 [Gestión de Materias](#75-gestión-de-materias)
   - 7.6 [Gestión de Horarios](#76-gestión-de-horarios)
   - 7.7 [Escáner de Acceso QR](#77-escáner-de-acceso-qr)
   - 7.8 [Generador de Carnets Digitales](#78-generador-de-carnets-digitales)
   - 7.9 [Historial de Accesos](#79-historial-de-accesos)
   - 7.10 [Centro de Notificaciones](#710-centro-de-notificaciones)
8. [Configuración de Notificaciones por Telegram](#8-configuración-de-notificaciones-por-telegram)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Carga de Datos Semilla](#10-carga-de-datos-semilla)
11. [Estructura del Proyecto](#11-estructura-del-proyecto)
12. [API REST — Referencia Rápida](#12-api-rest--referencia-rápida)
13. [Resolución de Problemas](#13-resolución-de-problemas)
14. [Preguntas Frecuentes (FAQ)](#14-preguntas-frecuentes-faq)

---

## 1. Introducción

**ControlQR** es una aplicación web académica diseñada para gestionar el control de ingreso de estudiantes en instituciones educativas mediante códigos QR. El sistema permite:

- ✅ Registrar y gestionar estudiantes, acudientes, docentes, materias y horarios.
- ✅ Generar carnets digitales con código QR único por estudiante.
- ✅ Escanear códigos QR para validar el ingreso de estudiantes en tiempo real.
- ✅ Identificar automáticamente la materia programada según el día y hora del ingreso.
- ✅ Enviar notificaciones automáticas (simuladas o por Telegram) a acudientes y docentes.
- ✅ Visualizar métricas y estadísticas en un dashboard administrativo.

> **Nota:** Este es un MVP académico funcional. No incluye biometría, RFID, NFC ni integraciones con ERP institucionales reales.

---

## 2. Requisitos Previos

Antes de instalar y ejecutar el sistema, asegúrate de tener instalado lo siguiente:

| Software       | Versión Mínima | Descarga                                    |
|----------------|---------------|----------------------------------------------|
| **Node.js**    | v18.x o superior | [nodejs.org](https://nodejs.org/)          |
| **npm**        | v9.x o superior  | Incluido con Node.js                       |
| **MongoDB**    | v6.x o superior  | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **Git**        | Cualquiera       | [git-scm.com](https://git-scm.com/)       |
| **Navegador**  | Chrome / Edge / Firefox (actualizados) | —                        |

### Verificar instalaciones

Abre una terminal y ejecuta:

```bash
node --version    # Debe mostrar v18.x o superior
npm --version     # Debe mostrar v9.x o superior
mongod --version  # Verifica MongoDB instalado
```

---

## 3. Instalación y Configuración

### 3.1. Clonar o descargar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd Control_QR
```

### 3.2. Instalar dependencias

Desde la raíz del proyecto, ejecuta el siguiente comando para instalar las dependencias tanto del frontend como del backend de una sola vez:

```bash
npm run install:all
```

O puedes instalarlas por separado:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3.3. Configurar variables de entorno

Crea o edita el archivo **`.env.local`** en la raíz del proyecto con las siguientes variables:

```env
# Cadena de conexión a MongoDB (local o Atlas)
MONGODB_URI=mongodb://localhost:27017/controlqr

# Clave secreta para NextAuth.js (sesiones JWT)
NEXTAUTH_SECRET=tu_clave_secreta_aqui

# URL base del frontend
NEXTAUTH_URL=http://localhost:3000

# Token del Bot de Telegram (opcional, para notificaciones reales)
TELEGRAM_BOT_TOKEN=tu_token_de_telegram_aqui
```

> **⚠️ Importante:** Si usas MongoDB Atlas (nube), reemplaza `MONGODB_URI` con tu cadena de conexión de Atlas. Si no configuras MongoDB, el sistema utilizará un archivo JSON local (`mock_db.json`) como mecanismo de persistencia alternativo.

### 3.4. Iniciar MongoDB (si es local)

```bash
mongod --dbpath ./mongodb_data
```

---

## 4. Inicio del Sistema

### Opción A — Inicio simultáneo (recomendado)

Desde la raíz del proyecto:

```bash
npm run dev
```

Este comando inicia **ambos** servicios al mismo tiempo usando `concurrently`:
- 🖥️ **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend (Express API):** [http://localhost:5000](http://localhost:5000)

### Opción B — Inicio por separado

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Verificar que todo funciona

1. Abre tu navegador y visita: **[http://localhost:3000](http://localhost:3000)**
2. Deberías ver la pantalla de login del sistema.
3. Verifica que el backend responde visitando: **[http://localhost:5000](http://localhost:5000)**
   - Respuesta esperada: `{ "name": "ControlQR API Server", "status": "running", "version": "1.0.0" }`

---

## 5. Acceso al Sistema (Login)

El sistema cuenta con un módulo de autenticación protegido mediante **NextAuth.js** con estrategia JWT.

### Credenciales por defecto

| Campo        | Valor               |
|-------------|----------------------|
| **Usuario** | `Administrador`      |
| **Contraseña** | `admin123`        |

> También se acepta `admin` como nombre de usuario.

### Proceso de inicio de sesión

1. Accede a [http://localhost:3000/login](http://localhost:3000/login).
2. Ingresa el **usuario** y la **contraseña**.
3. Haz clic en **"Iniciar Sesión"**.
4. Serás redirigido automáticamente al **Dashboard Principal**.

### Cerrar sesión

- En la barra superior (**topbar**), haz clic en tu nombre de usuario o el botón de cerrar sesión.
- Serás redirigido a la pantalla de login.

> **🔒 Seguridad:** Todas las rutas del panel administrativo están protegidas por un middleware. Si intentas acceder a cualquier página sin estar autenticado, serás redirigido al login.

---

## 6. Navegación General

El sistema utiliza un layout administrativo con los siguientes elementos:

### Sidebar (Barra Lateral)

El menú de navegación lateral contiene acceso rápido a todos los módulos:

| Icono | Módulo              | Ruta                |
|-------|---------------------|---------------------|
| 📊    | Dashboard           | `/dashboard`        |
| 👥    | Estudiantes         | `/students`         |
| 👪    | Acudientes          | `/guardians`        |
| 👨‍🏫   | Docentes            | `/teachers`         |
| 📚    | Materias            | `/subjects`         |
| 🗓️    | Horarios            | `/schedules`        |
| 📷    | Escáner QR          | `/scanner`          |
| 🎴    | Carnets             | `/students` (pestaña carnets) |
| 📜    | Historial Accesos   | `/access-logs`      |
| 🔔    | Notificaciones      | `/notifications`    |

### Topbar (Barra Superior)

- Muestra el nombre del usuario autenticado.
- Proporciona acceso rápido para cerrar sesión.

---

## 7. Módulos del Sistema

### 7.1. Dashboard Principal

**Ruta:** `/dashboard`

El dashboard presenta un resumen visual de las métricas principales (KPIs) del sistema:

#### Tarjetas de KPI
- **Total de Estudiantes:** Número total de estudiantes registrados en el sistema.
- **Total de Docentes:** Número de docentes activos.
- **Total de Materias:** Cantidad de asignaturas registradas.
- **Ingresos Hoy:** Cantidad de accesos registrados en el día actual.
- **Ingresos Totales:** Acumulado histórico de accesos.

#### Gráficos y Actividad
- **Gráfico de ingresos por día:** Visualización del flujo de ingresos diarios (usando Recharts).
- **Últimos ingresos registrados:** Lista de la actividad más reciente.
- **Últimas notificaciones:** Resumen de las notificaciones generadas.

---

### 7.2. Gestión de Estudiantes

**Ruta:** `/students`

Módulo CRUD completo para la gestión de estudiantes.

#### Listado de Estudiantes
- Tabla con búsqueda y filtros por nombre, documento o código estudiantil.
- Columnas: Nombre, Apellidos, Documento, Código, Programa Académico, Estado.
- Acciones por fila: **Ver**, **Editar**, **Eliminar**.

#### Crear un Nuevo Estudiante

1. Haz clic en el botón **"Nuevo Estudiante"** o navega a `/students/new`.
2. Completa el formulario con los siguientes campos:

| Campo                  | Tipo       | Obligatorio | Descripción                          |
|------------------------|-----------|-------------|--------------------------------------|
| Nombres                | Texto     | ✅          | Nombres del estudiante               |
| Apellidos              | Texto     | ✅          | Apellidos del estudiante             |
| Tipo de Documento      | Selector  | ✅          | CC, TI, CE, etc.                     |
| Número de Documento    | Texto     | ✅          | Número de identificación             |
| Código Estudiantil     | Texto     | ✅          | Código institucional único           |
| Correo Institucional   | Email     | ❌          | Correo del estudiante                |
| Programa Académico     | Texto     | ✅          | Programa o grado que cursa           |
| Semestre               | Número    | ❌          | Semestre actual                      |
| Estado                 | Selector  | ✅          | `activo` o `inactivo`                |
| Foto                   | URL/Archivo | ❌       | Foto del estudiante                  |
| Acudiente              | Selector  | ❌          | Acudiente vinculado                  |

3. Haz clic en **"Guardar"**.
4. El sistema generará automáticamente un **código QR único** para el estudiante.

#### Editar Estudiante
- Desde el listado, haz clic en el ícono de edición.
- Modifica los campos necesarios y guarda los cambios.

#### Eliminar Estudiante
- Desde el listado, haz clic en el ícono de eliminar.
- Confirma la eliminación en el diálogo de confirmación.

#### Ver Detalle del Estudiante
- Ruta: `/students/[id]`
- Muestra toda la información del estudiante, su carnet digital, historial de accesos y acudiente vinculado.

---

### 7.3. Gestión de Acudientes

**Ruta:** `/guardians`

Módulo CRUD para registrar y gestionar acudientes/representantes legales.

#### Campos del Acudiente

| Campo             | Tipo   | Obligatorio | Descripción                            |
|-------------------|--------|-------------|----------------------------------------|
| Nombre Completo   | Texto  | ✅          | Nombre completo del acudiente          |
| Parentesco        | Texto  | ✅          | Relación con el estudiante (padre, madre, tutor, etc.) |
| Correo            | Email  | ❌          | Correo electrónico de contacto         |
| Teléfono          | Texto  | ❌          | Teléfono de contacto                   |
| Telegram Chat ID  | Texto  | ❌          | ID de chat de Telegram para notificaciones reales |

#### Operaciones
- **Crear:** Registra un nuevo acudiente con sus datos de contacto.
- **Editar:** Modifica la información de un acudiente existente.
- **Eliminar:** Elimina un acudiente del sistema.
- **Listar:** Visualiza todos los acudientes registrados con filtros de búsqueda.
- **Vincular:** Asigna un acudiente a uno o varios estudiantes.

> **💡 Tip:** Si configuras el campo `Telegram Chat ID`, las notificaciones se enviarán en tiempo real al acudiente a través de Telegram.

---

### 7.4. Gestión de Docentes

**Ruta:** `/teachers`

Módulo CRUD para el registro y gestión de docentes.

#### Campos del Docente

| Campo         | Tipo   | Obligatorio | Descripción                     |
|--------------|--------|-------------|---------------------------------|
| Nombres      | Texto  | ✅          | Nombres del docente             |
| Apellidos    | Texto  | ✅          | Apellidos del docente           |
| Correo       | Email  | ❌          | Correo electrónico              |
| Teléfono     | Texto  | ❌          | Teléfono de contacto            |
| Facultad     | Texto  | ❌          | Facultad o programa asignado    |

#### Operaciones
- **Crear**, **Editar**, **Eliminar** y **Listar** docentes.
- Los docentes se vinculan con las materias y horarios que imparten.

---

### 7.5. Gestión de Materias

**Ruta:** `/subjects`

Módulo CRUD para el registro de asignaturas/materias.

#### Campos de la Materia

| Campo              | Tipo      | Obligatorio | Descripción                        |
|-------------------|-----------|-------------|------------------------------------|
| Nombre            | Texto     | ✅          | Nombre de la materia               |
| Código de Materia | Texto     | ✅          | Código identificador único         |
| Docente           | Selector  | ✅          | Docente asignado a la materia      |
| Programa Académico| Texto     | ❌          | Programa al que pertenece          |
| Semestre Sugerido | Número    | ❌          | Semestre recomendado para cursarla |

#### Operaciones
- **Crear**, **Editar**, **Eliminar** y **Listar** materias.
- Cada materia queda vinculada a un docente responsable.

---

### 7.6. Gestión de Horarios

**Ruta:** `/schedules`

Módulo clave del sistema. Permite definir el horario académico de cada estudiante, asignando materias por día y rango de horas.

#### Campos del Horario

| Campo        | Tipo      | Obligatorio | Descripción                        |
|-------------|-----------|-------------|------------------------------------|
| Estudiante  | Selector  | ✅          | Estudiante al que pertenece el horario |
| Materia     | Selector  | ✅          | Materia programada                 |
| Docente     | Selector  | ✅          | Docente de la materia              |
| Día         | Selector  | ✅          | Día de la semana (lunes a viernes) |
| Hora Inicio | Hora      | ✅          | Hora de inicio (formato HH:mm)     |
| Hora Fin    | Hora      | ✅          | Hora de finalización               |
| Aula        | Texto     | ❌          | Salón o aula de clase              |

#### ¿Cómo funciona la detección de materia?

Cuando se escanea un QR, el sistema:
1. Obtiene el **día actual** del sistema (lunes, martes, etc.).
2. Obtiene la **hora actual** del sistema.
3. Busca en los horarios del estudiante una coincidencia donde:
   - El **día** coincida con el día actual.
   - La **hora actual** esté entre `horaInicio` y `horaFin`.
4. Si encuentra coincidencia → Registra el ingreso con la materia, docente y aula.
5. Si **no** encuentra coincidencia → Registra el ingreso como `"sin clase programada"`.

> **⚠️ Importante:** También valida si el día es festivo colombiano o fin de semana, en cuyo caso el ingreso se marca como "día no académico".

---

### 7.7. Escáner de Acceso QR

**Ruta:** `/scanner`

Este es el **flujo principal** del sistema. Permite validar el ingreso de estudiantes escaneando su carnet QR.

#### Cómo escanear un ingreso

1. Navega a la sección **"Escáner QR"** desde el sidebar.
2. Se abrirá la **cámara web** del dispositivo automáticamente.
3. Apunta la cámara al **código QR del carnet** del estudiante.
4. El sistema procesará el QR automáticamente.

#### Flujo de validación

```
QR Escaneado
    │
    ├── ❌ QR inválido o formato incorrecto
    │       → Muestra: "Formato de QR inválido"
    │
    ├── ❌ Estudiante no encontrado
    │       → Muestra: "El estudiante no se encuentra registrado"
    │
    ├── ❌ Estudiante inactivo
    │       → Registra intento y muestra: "Estudiante inactivo. Ingreso rechazado"
    │
    ├── ⚠️ Fin de semana o festivo colombiano
    │       → Registra intento y muestra: "Día no académico"
    │
    ├── ⚠️ Sin clase programada en este horario
    │       → Registra ingreso como "sin clase programada"
    │
    └── ✅ Ingreso exitoso
            → Registra ingreso
            → Identifica materia, docente y aula
            → Genera notificaciones al acudiente y docente
            → Muestra resumen del ingreso
```

#### Resultado del escaneo exitoso

Después de un escaneo exitoso, el sistema muestra:
- **Datos del estudiante:** Nombre, código, programa.
- **Materia actual:** Nombre de la materia y docente.
- **Aula:** Salón asignado.
- **Hora de ingreso:** Fecha y hora exacta del registro.
- **Estado de notificaciones:** Si se enviaron vía Telegram o fueron simuladas.

#### Ingreso manual

Si la cámara no funciona, el escáner también permite ingresar manualmente el **código QR** (el texto JSON codificado en el QR) para realizar la validación.

---

### 7.8. Generador de Carnets Digitales

El sistema incluye un generador de carnets digitales con diseño institucional tipo SENA.

#### Características del carnet

- **Diseño vertical** tipo tarjeta de identificación (720×1280 px).
- **Código QR dinámico** único por estudiante.
- **Datos mostrados:** Nombre, apellido, programa académico, código estudiantil, número de documento, logo institucional.
- **Estilo visual:** Colores institucionales verde y amarillo, diseño premium con degradados, bordes redondeados y sombras suaves.

#### Panel de personalización

El generador incluye un panel lateral con opciones para personalizar el carnet:

- **Información personal:** Editar los datos mostrados en el carnet.
- **Colores:** Personalizar color principal, secundario, texto y footer.
- **Elementos visibles:** Activar/desactivar logo, QR, programa, documento, código, firma, fecha.
- **QR:** Seleccionar qué información codificar (Documento, Código, UUID, JSON, URL, ID, texto personalizado).

#### Exportación

| Formato | Descripción                                |
|---------|--------------------------------------------|
| **PNG** | Imagen de alta calidad del carnet          |
| **JPG** | Imagen comprimida del carnet               |
| **PDF** | Documento PDF listo para imprimir          |
| **Lote**| Generación masiva de múltiples carnets     |

#### Generación masiva

El sistema permite generar carnets para múltiples estudiantes de forma automática seleccionando los estudiantes desde la base de datos.

---

### 7.9. Historial de Accesos

**Ruta:** `/access-logs`

Registro histórico de todos los ingresos escaneados.

#### Información de cada registro

| Campo          | Descripción                                      |
|---------------|--------------------------------------------------|
| Estudiante    | Nombre del estudiante que ingresó                |
| Fecha         | Fecha del ingreso                                |
| Hora          | Hora exacta del ingreso                          |
| Método        | Método de validación (QR)                        |
| Materia       | Materia programada al momento del ingreso        |
| Docente       | Docente de la materia                            |
| Aula          | Aula asignada                                    |
| Estado        | `validado`, `sin clase programada`, `estudiante inactivo`, `qr inválido` |
| Mensaje       | Descripción del evento                           |

#### Filtros disponibles
- Filtrar por **estudiante**.
- Filtrar por **fecha** o rango de fechas.
- Filtrar por **estado** del acceso.

---

### 7.10. Centro de Notificaciones

**Ruta:** `/notifications`

Cada vez que se registra un ingreso válido, el sistema genera automáticamente **dos notificaciones**:

#### 1. Notificación al Acudiente
```
Se informa que el estudiante Juan Pérez ingresó a la institución el día
02/07/2026 a las 07:03 AM. Actualmente tiene programada la materia
Base de Datos con el docente Carlos Rodríguez en el aula 301.
```

#### 2. Notificación al Docente
```
Se ha registrado el ingreso del estudiante Juan Pérez el día
02/07/2026 a las 07:03 AM para la asignatura Base de Datos.
```

#### Campos de cada notificación

| Campo             | Descripción                            |
|-------------------|----------------------------------------|
| Tipo Destinatario | `acudiente` o `docente`                |
| Destinatario      | Nombre, correo o Telegram Chat ID      |
| Mensaje           | Texto completo de la notificación      |
| Fecha             | Fecha y hora de generación             |
| Estado            | `enviada` (Telegram), `simulada` o `pendiente` |
| Ingreso Relacionado| Referencia al registro de acceso       |

> **💡 Nota:** Las notificaciones son **simuladas** por defecto (se almacenan en la base de datos y se muestran en el panel). Si configuras Telegram, se enviarán de forma real.

---

## 8. Configuración de Notificaciones por Telegram

Para enviar notificaciones reales a los acudientes y docentes vía Telegram:

### Paso 1 — Crear un Bot de Telegram

1. Abre Telegram y busca a **@BotFather**.
2. Envía el comando `/newbot`.
3. Sigue las instrucciones para crear tu bot.
4. Copia el **Token HTTP API** que te proporcionará BotFather.

### Paso 2 — Configurar el token en el sistema

Agrega el token en tu archivo `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIjKlMnOpQrStUvWxYz
```

### Paso 3 — Obtener el Chat ID del destinatario

1. El acudiente o docente debe iniciar una conversación con tu bot en Telegram (enviar `/start`).
2. Visita `https://api.telegram.org/bot<TU_TOKEN>/getUpdates` en tu navegador.
3. Busca el campo `"chat": { "id": XXXXXXXX }` — ese es el **Chat ID**.

### Paso 4 — Registrar el Chat ID

- En el módulo de **Acudientes**, edita el acudiente y agrega su `Telegram Chat ID`.
- En el módulo de **Docentes**, si el modelo incluye el campo, agrega el Chat ID correspondiente.

### Resultado

Cuando se escanee el QR del estudiante, el acudiente y/o docente recibirá un mensaje automático en su Telegram con los detalles del ingreso.

---

## 9. Variables de Entorno

| Variable              | Obligatoria | Descripción                                  | Valor por defecto         |
|-----------------------|-------------|----------------------------------------------|---------------------------|
| `MONGODB_URI`         | ✅          | URI de conexión a MongoDB                    | —                         |
| `NEXTAUTH_SECRET`     | ✅          | Clave secreta para firmar tokens JWT         | —                         |
| `NEXTAUTH_URL`        | ✅          | URL base del frontend                        | `http://localhost:3000`   |
| `TELEGRAM_BOT_TOKEN`  | ❌          | Token del Bot de Telegram                    | —                         |
| `PORT`                | ❌          | Puerto del servidor backend Express          | `5000`                    |

---

## 10. Carga de Datos Semilla

El sistema incluye un endpoint de **seed** (datos semilla) que permite cargar datos de ejemplo para pruebas.

### Cargar datos de prueba

Visita la siguiente URL en tu navegador o haz una petición GET:

```
http://localhost:5000/api/seed
```

Esto creará registros de ejemplo para:
- 👤 Usuarios (administrador)
- 👥 Estudiantes
- 👪 Acudientes
- 👨‍🏫 Docentes
- 📚 Materias
- 🗓️ Horarios
- 📜 Registros de acceso

> **⚠️ Precaución:** Este endpoint está pensado solo para desarrollo y pruebas. No lo ejecutes en un entorno de producción con datos reales.

---

## 11. Estructura del Proyecto

```
Control_QR/
├── 📁 backend/                    # Servidor API Express
│   ├── 📁 controllers/            # Controladores de la lógica de negocio
│   │   ├── accessLogController.ts     # Historial de accesos
│   │   ├── dashboardController.ts     # Métricas del dashboard
│   │   ├── guardianController.ts      # CRUD de acudientes
│   │   ├── notificationController.ts  # Centro de notificaciones
│   │   ├── scannerController.ts       # Lógica principal de escaneo QR
│   │   ├── scheduleController.ts      # CRUD de horarios
│   │   ├── seedController.ts          # Datos semilla
│   │   ├── studentController.ts       # CRUD de estudiantes
│   │   ├── subjectController.ts       # CRUD de materias
│   │   └── teacherController.ts       # CRUD de docentes
│   ├── 📁 lib/                    # Utilidades del backend
│   │   ├── db.ts                      # Conexión a MongoDB / JSON fallback
│   │   ├── qr.ts                      # Generación de QR
│   │   ├── telegram.ts                # Integración con Telegram Bot API
│   │   └── validators.ts             # Validaciones con Zod
│   ├── 📁 models/                 # Modelos Mongoose (esquemas de BD)
│   │   ├── AccessLog.ts
│   │   ├── Guardian.ts
│   │   ├── Notification.ts
│   │   ├── Schedule.ts
│   │   ├── Student.ts
│   │   ├── Subject.ts
│   │   ├── Teacher.ts
│   │   └── User.ts
│   ├── routes.ts                  # Definición de rutas API
│   ├── server.ts                  # Punto de entrada del servidor
│   └── package.json
│
├── 📁 frontend/                   # Aplicación Next.js 14
│   ├── 📁 app/                    # App Router de Next.js
│   │   ├── 📁 (auth)/login/          # Página de login
│   │   ├── 📁 (dashboard)/           # Grupo de rutas del panel admin
│   │   │   ├── dashboard/                # Dashboard principal
│   │   │   ├── students/                 # Gestión de estudiantes
│   │   │   ├── guardians/                # Gestión de acudientes
│   │   │   ├── teachers/                 # Gestión de docentes
│   │   │   ├── subjects/                 # Gestión de materias
│   │   │   ├── schedules/                # Gestión de horarios
│   │   │   ├── scanner/                  # Escáner QR
│   │   │   ├── access-logs/              # Historial de accesos
│   │   │   ├── notifications/            # Centro de notificaciones
│   │   │   └── layout.tsx                # Layout del dashboard (sidebar+topbar)
│   │   ├── 📁 api/auth/[...nextauth]/    # Handler de NextAuth
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── 📁 components/             # Componentes reutilizables
│   │   ├── 📁 layout/
│   │   │   ├── sidebar.tsx            # Barra lateral de navegación
│   │   │   └── topbar.tsx             # Barra superior
│   │   └── 📁 shared/
│   │       ├── carnet-digital.tsx      # Componente de carnet digital
│   │       └── page-header.tsx         # Encabezado reutilizable
│   ├── 📁 lib/                    # Utilidades del frontend
│   │   ├── auth.ts                    # Configuración de NextAuth
│   │   ├── db.ts                      # Conexión a BD desde frontend
│   │   ├── qr.ts                      # Utilidades QR
│   │   ├── telegram.ts               # Envío de mensajes Telegram
│   │   ├── utils.ts                   # Utilidades generales
│   │   └── validators.ts             # Validaciones con Zod
│   ├── middleware.ts              # Middleware de protección de rutas
│   └── package.json
│
├── .env.local                     # Variables de entorno
├── mock_db.json                   # Persistencia JSON alternativa
├── package.json                   # Scripts raíz del monorepo
└── README_PROYECTO.md             # Documentación técnica del proyecto
```

---

## 12. API REST — Referencia Rápida

El backend expone una API REST en `http://localhost:5000/api`. Todas las rutas están organizadas por recurso:

### Estudiantes (`/api/students`)

| Método | Ruta                  | Descripción                 |
|--------|-----------------------|-----------------------------|
| GET    | `/api/students`       | Listar todos los estudiantes|
| POST   | `/api/students`       | Crear nuevo estudiante      |
| GET    | `/api/students/:id`   | Obtener estudiante por ID   |
| PUT    | `/api/students/:id`   | Actualizar estudiante       |
| DELETE | `/api/students/:id`   | Eliminar estudiante         |

### Acudientes (`/api/guardians`)

| Método | Ruta                   | Descripción                 |
|--------|------------------------|-----------------------------|
| GET    | `/api/guardians`       | Listar todos los acudientes |
| POST   | `/api/guardians`       | Crear nuevo acudiente       |
| GET    | `/api/guardians/:id`   | Obtener acudiente por ID    |
| PUT    | `/api/guardians/:id`   | Actualizar acudiente        |
| DELETE | `/api/guardians/:id`   | Eliminar acudiente          |

### Docentes (`/api/teachers`)

| Método | Ruta                  | Descripción                |
|--------|-----------------------|----------------------------|
| GET    | `/api/teachers`       | Listar todos los docentes  |
| POST   | `/api/teachers`       | Crear nuevo docente        |
| GET    | `/api/teachers/:id`   | Obtener docente por ID     |
| PUT    | `/api/teachers/:id`   | Actualizar docente         |
| DELETE | `/api/teachers/:id`   | Eliminar docente           |

### Materias (`/api/subjects`)

| Método | Ruta                  | Descripción                |
|--------|-----------------------|----------------------------|
| GET    | `/api/subjects`       | Listar todas las materias  |
| POST   | `/api/subjects`       | Crear nueva materia        |
| GET    | `/api/subjects/:id`   | Obtener materia por ID     |
| PUT    | `/api/subjects/:id`   | Actualizar materia         |
| DELETE | `/api/subjects/:id`   | Eliminar materia           |

### Horarios (`/api/schedules`)

| Método | Ruta                   | Descripción                |
|--------|------------------------|----------------------------|
| GET    | `/api/schedules`       | Listar todos los horarios  |
| POST   | `/api/schedules`       | Crear nuevo horario        |
| GET    | `/api/schedules/:id`   | Obtener horario por ID     |
| PUT    | `/api/schedules/:id`   | Actualizar horario         |
| DELETE | `/api/schedules/:id`   | Eliminar horario           |

### Escáner (`/api/scanner`)

| Método | Ruta                      | Descripción                           |
|--------|---------------------------|---------------------------------------|
| POST   | `/api/scanner/validate`   | Validar escaneo de QR                 |

**Body esperado:**
```json
{
  "qrData": "{\"studentId\":\"...\",\"codigoEstudiantil\":\"...\",\"documento\":\"...\"}",
  "metodo": "QR"
}
```

### Otros endpoints

| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/access-logs`      | Historial de accesos                 |
| GET    | `/api/notifications`    | Centro de notificaciones             |
| GET    | `/api/dashboard/stats`  | Estadísticas del dashboard           |
| GET    | `/api/seed`             | Cargar datos semilla                 |

---

## 13. Resolución de Problemas

### ❌ "No se puede conectar a MongoDB"

**Causas posibles:**
1. MongoDB no está ejecutándose. Inicia el servicio:
   ```bash
   mongod --dbpath ./mongodb_data
   ```
2. La variable `MONGODB_URI` en `.env.local` es incorrecta. Verifica la cadena de conexión.
3. Si usas MongoDB Atlas, verifica que tu IP esté en la lista de IPs permitidas.

> **Fallback:** Si MongoDB no está disponible, el sistema usará el archivo `mock_db.json` como almacenamiento alternativo.

---

### ❌ "Error de autenticación al iniciar sesión"

**Soluciones:**
1. Verifica que estás usando las credenciales correctas: **Administrador** / **admin123**.
2. Asegúrate de que la variable `NEXTAUTH_SECRET` esté configurada en `.env.local`.
3. Verifica que el backend esté corriendo en el puerto 5000.

---

### ❌ "La cámara no se activa en el escáner"

**Soluciones:**
1. **Permisos del navegador:** Asegúrate de permitir el acceso a la cámara cuando el navegador lo solicite.
2. **HTTPS:** Algunos navegadores requieren HTTPS para acceder a la cámara. En desarrollo local con `localhost`, esto no debería ser problema.
3. **Otro programa usando la cámara:** Cierra cualquier otra aplicación que esté usando la cámara (Zoom, Teams, etc.).
4. **Ingreso manual:** Usa la opción de ingreso manual de código QR como alternativa.

---

### ❌ "Las notificaciones de Telegram no se envían"

**Soluciones:**
1. Verifica que `TELEGRAM_BOT_TOKEN` sea correcto en `.env.local`.
2. El destinatario debe haber iniciado conversación con el bot (enviar `/start`).
3. Verifica que el `Telegram Chat ID` esté correctamente registrado en el acudiente/docente.
4. Revisa la consola del backend para errores de la API de Telegram.

---

### ❌ "El frontend no carga / Error 500"

**Soluciones:**
1. Limpia la caché de Next.js:
   ```bash
   npm run clean
   ```
2. Reinstala dependencias:
   ```bash
   cd frontend
   rm -rf node_modules .next
   npm install
   npm run dev
   ```
3. Verifica que no haya conflictos de puertos (3000 y 5000).

---

### ❌ "Los datos no se guardan"

**Soluciones:**
1. Verifica que el backend esté corriendo (`http://localhost:5000`).
2. Revisa la conexión a MongoDB en la consola del backend.
3. Si usas el fallback JSON, verifica que el archivo `mock_db.json` tenga permisos de escritura.

---

## 14. Preguntas Frecuentes (FAQ)

### ¿Puedo usar el sistema sin MongoDB?
**Sí.** El sistema incluye un mecanismo de persistencia alternativo basado en un archivo JSON (`mock_db.json`). Se activa automáticamente cuando no se puede conectar a MongoDB.

### ¿Funciona en dispositivos móviles?
**Sí.** La interfaz es responsive y se adapta a pantallas de tablets y teléfonos. El escáner QR funciona con la cámara del dispositivo móvil, pero debe accederse desde un navegador web.

### ¿Puedo desplegar este sistema en producción?
Este proyecto es un **MVP académico** diseñado para demostraciones y proyectos universitarios. Para producción se recomienda:
- Configurar autenticación robusta con contraseñas encriptadas.
- Usar HTTPS.
- Configurar variables de entorno seguras.
- Implementar rate limiting y validaciones de seguridad adicionales.

### ¿Qué información contiene el código QR?
El QR contiene un JSON con la siguiente estructura:
```json
{
  "studentId": "ObjectId del estudiante",
  "codigoEstudiantil": "Código institucional",
  "documento": "Número de documento"
}
```

### ¿Cómo agregar más festivos colombianos?
Los festivos están definidos en el archivo `backend/controllers/scannerController.ts`. Edita el array `festivos2026` para agregar o modificar fechas.

### ¿El sistema soporta múltiples administradores?
Actualmente el sistema está diseñado para un único administrador. Puedes extenderlo agregando más registros en la colección `users` con rol `admin`.

---

> **📧 Soporte:** Para dudas adicionales o reportar errores, contacta al equipo de desarrollo del proyecto.

---

*Documento generado para el proyecto ControlQR — Sistema de Control de Ingreso Estudiantil con QR.*

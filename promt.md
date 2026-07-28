SISTEMA COMPACTO DE CONTROL DE INGRESO ESTUDIANTIL CON QR Y NOTIFICACIONES
CONTEXTO DEL PROYECTO

Quiero desarrollar una aplicación web académica compacta como proyecto universitario para una entidad de educación superior pública. El objetivo del sistema es simular un control de ingreso estudiantil mediante carnet con código QR, validando la identidad del estudiante, consultando automáticamente la materia que tiene programada en ese momento según su horario, registrando el ingreso en la base de datos y generando una notificación automática simulada para el acudiente y el docente.

Este proyecto NO debe construirse como un sistema enterprise real, sino como un MVP funcional, compacto, demostrable y bien diseñado, enfocado en mostrar el flujo principal del proceso.

OBJETIVO GENERAL DEL SISTEMA

Desarrollar un sistema web de control de ingreso estudiantil que permita:

Registrar estudiantes, acudientes, docentes, materias y horarios
Generar y leer un carnet con código QR
Validar el ingreso del estudiante al escanear el QR
Consultar automáticamente la materia actual según día y hora
Registrar la fecha y hora de ingreso
Generar una notificación simulada para acudiente y docente
Visualizar el historial de ingresos en un dashboard administrativo
ALCANCE DEL MVP ACADÉMICO

El sistema debe ser una versión compacta y funcional con enfoque académico.
No quiero un software institucional complejo, sino una demo profesional con módulos bien definidos, buena interfaz, lógica realista y base de datos estructurada.

EL SISTEMA DEBE INCLUIR SOLAMENTE:
Login administrativo básico
Gestión de estudiantes
Gestión de acudientes
Gestión de docentes
Gestión de materias
Gestión de horarios
Generación de QR por estudiante
Escaneo/lectura de QR desde cámara o ingreso manual del código
Validación del estudiante
Identificación de la materia actual según el horario y la hora del sistema
Registro de ingreso
Notificación simulada
Historial de ingresos
Dashboard básico con métricas
LO QUE NO DEBE INCLUIR

No quiero que el sistema incluya:

RFID real
NFC real
biometría
torniquetes
integración con ERP institucional real
integración con plataformas académicas reales
WhatsApp real obligatorio
microservicios innecesarios
arquitectura excesivamente compleja
multi-sede
app móvil nativa
funciones enterprise
STACK TECNOLÓGICO OBLIGATORIO

Construye el sistema con el siguiente stack:

Frontend + Backend
Next.js 14+ con App Router
TypeScript
Tailwind CSS
Shadcn/ui para componentes modernos
React Hook Form + Zod para formularios y validaciones
Base de datos
MongoDB con Mongoose
Autenticación
autenticación simple para administrador usando NextAuth o un sistema simple con credenciales
Librerías adicionales sugeridas
generación de QR para carnet
lector QR por cámara web
tabla de datos con búsqueda y filtros
toast notifications
gráficos simples para dashboard
DISEÑO GENERAL DEL SISTEMA

Quiero un sistema con una interfaz moderna, limpia, académica y profesional, tipo dashboard administrativo.
Debe verse como una plataforma web seria, no como una maqueta escolar básica.

ESTILO VISUAL
diseño moderno
layout administrativo
sidebar lateral
topbar superior
tarjetas KPI
tablas limpias
formularios bien organizados
colores institucionales sobrios
responsive
buena UX
ESTRUCTURA FUNCIONAL DEL SISTEMA
1. MÓDULO DE AUTENTICACIÓN

Crear un login para el administrador del sistema.

Funciones:
iniciar sesión
cerrar sesión
proteger rutas privadas
redirigir al dashboard después del login
Datos mínimos del usuario administrador:
nombre
correo
contraseña
rol
2. MÓDULO DE ESTUDIANTES

Debe existir un CRUD completo de estudiantes.

Campos del estudiante:
id
nombres
apellidos
tipo de documento
número de documento
código estudiantil
correo institucional
programa académico
semestre
estado (activo/inactivo)
foto opcional
id del acudiente
qrCode
createdAt
updatedAt
Funciones:
crear estudiante
editar estudiante
eliminar estudiante
listar estudiantes
buscar por nombre, documento o código
ver detalle del estudiante
generar código QR único del carnet
3. MÓDULO DE ACUDIENTES

CRUD de acudientes.

Campos:
id
nombre completo
parentesco
correo
teléfono
relación con el estudiante
Funciones:
registrar acudiente
asignar acudiente a uno o varios estudiantes
editar acudiente
listar acudientes
4. MÓDULO DE DOCENTES

CRUD de docentes.

Campos:
id
nombres
apellidos
correo
teléfono
facultad o programa
Funciones:
crear docente
editar docente
eliminar docente
listar docentes
5. MÓDULO DE MATERIAS

CRUD de materias.

Campos:
id
nombre de la materia
código de materia
docenteId
programa académico
semestre sugerido
Funciones:
crear materia
editar materia
eliminar materia
listar materias
relacionar materia con docente
6. MÓDULO DE HORARIOS

Este módulo es clave. Debe permitir asignar a cada estudiante sus materias por día y rango horario.

Campos del horario:
id
studentId
subjectId
teacherId
día de la semana
horaInicio
horaFin
aula opcional
Funciones:
crear horario por estudiante
editar horario
listar horario por estudiante
ver horario semanal
permitir varios bloques por día
7. MÓDULO DE CARNET DIGITAL CON QR

Cada estudiante debe tener un carnet digital con QR.

Requerimientos:
generar un código QR único por estudiante
el QR puede contener:
studentId
código estudiantil
documento
mostrar vista del carnet digital
permitir descargar o visualizar el QR
usar este QR como mecanismo de validación de ingreso
8. MÓDULO DE ESCANEO Y VALIDACIÓN DE INGRESO

Este es el flujo principal del proyecto.

Flujo esperado:
el administrador entra a la pantalla “Escanear ingreso”
se abre la cámara o se permite ingresar manualmente un código QR
el sistema lee el código
identifica al estudiante
valida si el estudiante está activo
consulta el horario del día actual
determina qué materia está viendo en ese momento según la hora del sistema
registra el ingreso en la base de datos
genera una notificación simulada
muestra un resumen del ingreso exitoso
Validaciones del flujo:
si el QR no existe, mostrar error
si el estudiante está inactivo, bloquear el ingreso
si el estudiante no tiene clase en esa hora, mostrar mensaje tipo:
“El estudiante no tiene una materia programada en este momento”
aun así se puede registrar el ingreso como “sin materia asignada” si se desea
9. LÓGICA PARA DETECTAR LA MATERIA ACTUAL

Implementa una lógica robusta para identificar la materia que el estudiante debería estar viendo al momento del ingreso.

Reglas:
obtener el día actual del sistema
obtener la hora actual del sistema
buscar en la colección de horarios del estudiante una coincidencia donde:
el día coincida
la hora actual esté entre horaInicio y horaFin
si existe coincidencia:
retornar materia
retornar docente
retornar aula si existe
si no existe coincidencia:
marcar el ingreso como “sin clase programada”
10. MÓDULO DE REGISTRO DE INGRESOS

Cada escaneo debe crear un registro de ingreso.

Campos del registro:
id
studentId
fecha
hora
timestamp completo
método de validación: QR
subjectId opcional
teacherId opcional
aula opcional
estado:
validado
estudiante inactivo
sin clase programada
qr inválido
mensaje de notificación generado
Funciones:
guardar ingreso
listar historial de ingresos
filtrar por estudiante
filtrar por fecha
ver detalle del ingreso
11. MÓDULO DE NOTIFICACIONES SIMULADAS

No quiero integración obligatoria con WhatsApp real.
Quiero una simulación profesional del envío de notificaciones.

Cuando se registre un ingreso válido, generar 2 notificaciones:
1. Notificación al acudiente

Ejemplo:
“Se informa que el estudiante Juan Pérez ingresó a la institución el día 02/07/2026 a las 07:03 AM. Actualmente tiene programada la materia Base de Datos con el docente Carlos Rodríguez.”

2. Notificación al docente

Ejemplo:
“Se ha registrado el ingreso del estudiante Juan Pérez el día 02/07/2026 a las 07:03 AM para la asignatura Base de Datos.”

Cómo simularlas:

Implementa una o varias de estas opciones:

guardarlas en una colección notifications
mostrarlas en pantalla al finalizar el escaneo
enviarlas por correo de prueba usando Nodemailer
crear un centro de notificaciones dentro del dashboard
Estructura sugerida de notificación:
id
tipo destinatario: acudiente / docente
destinatario
mensaje
fecha
estado: enviada / simulada / pendiente
ingreso relacionado
12. DASHBOARD ADMINISTRATIVO

Crear un dashboard visual con métricas básicas.

KPIs sugeridos:
total de estudiantes registrados
total de docentes
total de materias
ingresos registrados hoy
ingresos totales
estudiantes con ingreso reciente
Gráficos o bloques visuales:
ingresos por día
ingresos por materia
últimos ingresos registrados
últimas notificaciones generadas
13. PÁGINAS DEL SISTEMA

Quiero que estructures el proyecto con páginas claras dentro del panel administrativo.

Páginas mínimas:
/login
/dashboard
/students
/students/new
/students/[id]
/guardians
/teachers
/subjects
/schedules
/scanner
/access-logs
/notifications
/settings opcional
MODELO DE BASE DE DATOS

Diseña los schemas de MongoDB/Mongoose para:

User
Student
Guardian
Teacher
Subject
Schedule
AccessLog
Notification

Cada modelo debe incluir:

campos bien tipados
referencias entre colecciones
timestamps
validaciones mínimas
índices útiles si aplican
REQUERIMIENTOS DE DESARROLLO

Quiero que generes el proyecto de forma modular, limpia y escalable, con buena organización de carpetas y buenas prácticas.

Requisitos técnicos:
TypeScript estricto
componentes reutilizables
server actions o API routes bien organizadas
separación entre UI, lógica y acceso a datos
manejo de errores
validaciones de formularios
mensajes de éxito y error
loading states
empty states
tablas con búsqueda y filtros
arquitectura clara y mantenible
ESTRUCTURA DE CARPETAS SUGERIDA

Propón e implementa una estructura profesional tipo:

app
components
lib
models
actions o api
hooks
utils
types
config
LO QUE QUIERO QUE GENERES

Quiero que construyas este proyecto completo y me entregues, de forma ordenada:

1. Arquitectura del proyecto
estructura de carpetas
explicación de módulos
flujo general del sistema
2. Modelado de base de datos
schemas Mongoose completos
relaciones entre entidades
3. Pantallas del sistema
dashboard
CRUDs
escáner
historial
notificaciones
4. Lógica de negocio
generación de QR
lectura/validación de QR
detección de materia por horario
registro de ingreso
generación de notificaciones
5. Código base funcional

Genera el código inicial del proyecto incluyendo:

configuración de Next.js
conexión a MongoDB
modelos
páginas
componentes
formularios
tablas
flujo del escáner
registro de ingresos
dashboard inicial
6. Datos semilla

Agrega datos de ejemplo para:

estudiantes
acudientes
docentes
materias
horarios
registros de ingreso
ENFOQUE DE LA RESPUESTA

Quiero que respondas como arquitecto de software y desarrollador senior full stack, construyendo una solución profesional, bien pensada y lista para evolucionar.

La respuesta debe:
estar en español
ser técnica pero clara
generar código limpio
proponer una UI moderna
priorizar funcionalidad real del MVP
evitar complejidad innecesaria
enfocarse en una tarea universitaria compacta pero muy bien presentada
EXTRA IMPORTANTE

Antes de empezar el código:

define claramente la arquitectura
define el modelo de datos
define el flujo del escáner y validación
define cómo detectar la materia actual
luego genera el código por módulos

No quiero una respuesta superficial.
Quiero una solución coherente, usable, modular, académica y visualmente profesional.
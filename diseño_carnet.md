# OBJETIVO

Rediseñar completamente el módulo "Generador de Carnets" del sistema.

NO quiero un diseño parecido.

Quiero una reproducción prácticamente idéntica al carnet mostrado en la imagen de referencia.

El diseño debe ser completamente responsive y estar construido utilizando únicamente componentes reutilizables.

---

# ESTILO GENERAL

Diseño moderno.

Colores institucionales SENA.

Dominancia del verde.

Estilo limpio.

Sombras suaves.

Bordes redondeados.

Aspecto premium.

No utilizar tablas.

No utilizar estilos antiguos.

Todo debe verse como una aplicación profesional.

---

# DIMENSIONES

El carnet debe conservar la relación vertical tipo identificación.

aproximadamente

720 x 1280 px

con bordes redondeados de 30 px.

---

# ESTRUCTURA

────────────────────────────

HEADER

────────────────────────────

Centro:

Logo institucional.

Debajo:

Título

CARNET DIGITAL

tipografía:

ExtraBold

color blanco

muy grande.

A la derecha:

DIGITAL

color amarillo.

Debajo una banda amarilla con el texto

SENA CENTRO DE TECNOLOGÍA

centrado.

---

FONDO

Crear un fondo igual al de la referencia.

Debe incluir:

degradados verdes

curvas

formas diagonales

círculos

patrones de puntos

hexágonos tenues

ondas amarillas

sombras

No usar imágenes de fondo.

Todo debe hacerse mediante CSS.

---

CUERPO

En el centro colocar un gran contenedor blanco.

Bordes:

amarillo

verde

doble borde

radio 25 px

Dentro:

Código QR

centrado

ocupando aproximadamente el 65% del ancho.

El QR debe generarse dinámicamente.

Debe soportar:

texto

URL

JSON

UUID

ID del estudiante

Todo configurable.

---

DEBAJO DEL QR

Ícono circular de usuario.

Luego:

Nombre

muy grande

en negrita.

Debajo:

Apellido.

Debajo:

Programa académico.

Ejemplo

ADSO

en verde.

---

FOOTER

Barra verde completa.

Dividir en dos columnas.

Columna izquierda

Icono documento.

Texto

CÓDIGO

Número grande.

Ejemplo

20261003

Columna derecha

Icono escudo.

Texto

DOCUMENTO

Número grande.

Ejemplo

1034567890

Separador vertical amarillo.

---

EFECTOS

Sombras suaves.

Hover.

Animaciones.

Transiciones.

No exageradas.

---

PANEL DE EDICIÓN

A la izquierda del carnet construir un panel con pestañas.

Información personal

Nombre

Apellido

Documento

Código

Programa

Ficha

Centro

Regional

Estado

Fotografía

Logo

Escudo

QR

Color principal

Color secundario

Color texto

Color footer

Mostrar logo

Mostrar QR

Mostrar programa

Mostrar documento

Mostrar código

Mostrar firma

Mostrar fecha

Mostrar vencimiento

---

QR

Debe permitir seleccionar qué información codificar.

Opciones:

Documento

Código

UUID

JSON

URL

ID

Texto personalizado

---

PERSONALIZACIÓN

Permitir cambiar:

Color verde

Color amarillo

Color fondo

Color textos

Color footer

Color QR

Radio bordes

Sombras

Tipografía

Tamaño QR

Tamaño logo

---

EXPORTACIÓN

Botones:

Vista previa

Imprimir

Descargar PNG

Descargar JPG

Descargar PDF

Generar lote

Generar múltiples carnets

---

GENERACIÓN MASIVA

Permitir importar:

Excel

CSV

Base de datos

API

y generar cientos de carnets automáticamente.

---

TECNOLOGÍA

Implementar usando:

React

TypeScript

TailwindCSS

Framer Motion

Lucide Icons

QRCode

html-to-image

jspdf

Sin Bootstrap.

---

CÓDIGO

Crear componentes independientes:

<CardPreview/>

<CardHeader/>

<CardBody/>

<CardFooter/>

<QRCodeGenerator/>

<StudentForm/>

<ThemeEditor/>

<ExportPanel/>

Todo el código debe ser limpio.

Tipado.

Escalable.

Modular.

No dejar código duplicado.

Aplicar buenas prácticas SOLID.

Optimizar para producción.

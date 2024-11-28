# test-ikbo-backend

# Proyecto API Rest - test-ikbo-backend

Este proyecto es una API Rest desarrollada utilizando Node.js y MongoDB, diseñada para ser desplegada con Docker.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu sistema:

- [Node.js](https://nodejs.org/) v20.14.0
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)

## Instalación

Sigue estos pasos para configurar el entorno de desarrollo:

1. Clona el repositorio en tu máquina local:
   ```bash
   git clone <URL-del-repositorio>
   cd <nombre-del-proyecto>
   ```
2. Instala las dependencias del proyecto:
```bash
npm install
```
3. Inicia Docker Desktop.

4. Utiliza Docker Compose para desplegar la base de datos MongoDB:
```bash
docker-compose up -d
```
## Ejecución del Proyecto
Para ejecutar la API Rest localmente:

1. Asegúrate de que la base de datos esté en ejecución.

2. Inicia el servidor:
```bash
npm start
```
3. El proyecto estará disponible en el puerto 3001. Puedes acceder a la API a través de la URL:
```bash
http://localhost:3001
```

## Inicialización de Datos de Prueba

La API cuenta con una ruta específica para cargar datos de prueba en la base de datos. Para utilizarla:

1. Asegúrate de que la base de datos esté en ejecución.

2. Haz una solicitud GET a la siguiente ruta:
```bash
/api/seeds/init
```
Esto cargará datos iniciales en la base de datos.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:
```bash
test-ikbo-backend/
├── src/
│   ├── data-layer/     # Contiene la logica de datos para los servicios y la base de datos generada por Docker
│   ├── routes/     # Definición de rutas de la API
│   ├── controllers/ # Lógica de los controladores
│   ├── models/     # Modelos de la base de datos (MongoDB)
│   ├── services/     # Servicios para implementar las interacciones con la Bse de Datos (MongoDB)
│   └── ...         # Otros directorios y archivos
├── .env                # Archivo con las variables de Entorno
├── docker-compose.yml  # Configuración para desplegar MongoDB con Docker
├── package.json        # Dependencias del proyecto
└── README.md           # Documentación del proyecto
```
Herramientas Recomendadas
Editor de Código: Visual Studio Code es ideal para trabajar con este proyecto. Se recomienda instalar las extensiones relacionadas con JavaScript, Node.js y Docker para facilitar el desarrollo.
# Proyecto Node.js con Express y SQLite para API RESTful

Este repositorio contiene un servidor Node.js con Express que gestiona una pequeña base de datos SQLite y sirve como backend para una aplicación frontend Angular a través de una API RESTful.

## Funcionalidades

- **Gestión de Datos:** Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en una base de datos SQLite.
- **API RESTful:** Expone endpoints para interactuar con los datos a través de peticiones HTTP.
- **Conexión con Angular:** Diseñado para ser consumido por una aplicación frontend Angular para la gestión de datos.

## Requisitos

- Node.js instalado en tu máquina local. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio

2. **Instala las dependencias:**

   ```bash
   npm install

3. Configuración de la base de datos:

La configuración de SQLite se encuentra en el archivo config/db.js. Asegúrate de que la ruta del archivo de base de datos (databasePath) esté configurada correctamente para tu entorno.


## Ejecución

1. **Inicia el servidor:**
   ```bash
   npm start

Esto iniciará el servidor Express en el puerto 3000 por defecto.


## Licencia

Este proyecto está licenciado bajo la Licencia MIT.



# Sistema de Gestión Inmobiliaria

Aplicación web para administrar productos y categorías de una inmobiliaria.

## Descripción

Sistema web que permite gestionar productos inmobiliarios y sus categorías con una interfaz basada en Bootstrap 5.

## Características

- Gestión de productos (crear, editar, eliminar, listar)
- Gestión de categorías
- Paginación (20 elementos por página)
- Interfaz responsiva

## Tecnologías

- HTML5, CSS3, JavaScript
- Bootstrap 5.3.2
- Fetch API

## Estructura del Proyecto

```
inmobiliaria_web/
├── CSS/                 # Estilos
├── JS/                  # Lógica JavaScript
└── pages/               # Páginas HTML
    ├── index.html
    ├── categorias/
    └── productos/
```

## Instalación

1. **Clonar el proyecto**

   ```bash
   git clone <url-del-repositorio>
   cd inmobiliaria_web
   ```

2. **Iniciar servidor local**

   Live Server en VS Code

3. **Configurar el backend**

   Asegurar que el backend esté en: `http://localhost:8080`

## Endpoints del Backend

### Productos

- GET `/api/producto/listar?page={page}&size={size}`
- POST `/api/producto/register`
- PUT `/api/producto/actualizar/{id}`
- DELETE `/api/producto/{id}`

### Categorías

- GET `/api/categoria/listar?page={page}&size={size}`
- POST `/api/categoria/register`
- PUT `/api/categoria/actualizar/{id}`
- DELETE `/api/categoria/{id}`

## Configuración

Para cambiar la URL del backend, editar en `JS/productos.js` y `JS/categorias.js`:

```javascript
fetch(`http://localhost:8080/api/...`);
```

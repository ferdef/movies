# Movies Tracker

Una aplicación web personal similar a JustWatch para rastrear películas y series vistas utilizando la API de TMDB.

## Características

- 🎬 **Búsqueda de contenido**: Busca películas y series usando la API de TMDB
- ✅ **Marcado directo como visto**: Marca cualquier película/serie como vista sin necesidad de añadirla primero a una lista
- 📝 **Lista personal**: Mantén una lista de películas y series para ver más tarde (opcional)
- 👍 **Sistema de valoraciones**: Dale me gusta o no me gusta al contenido visto
- 📺 **Seguimiento de episodios**: Marca episodios y temporadas individuales como vistas
- 🎯 **Recomendaciones**: Obtén recomendaciones basadas en tus gustos y filtros personalizados
- 🔐 **Autenticación segura**: Sistema de login seguro con JWT
- 🐳 **Docker**: Completamente dockerizado para fácil despliegue
- 🔒 **Seguridad**: Configurado para funcionar con SWAG/Portainer

## Arquitectura

- **Frontend**: React con styled-components y React Query
- **Backend**: Node.js/Express con Sequelize ORM
- **Base de datos**: PostgreSQL
- **Proxy**: Nginx para SSL y proxy reverso
- **API externa**: The Movie Database (TMDB)

## Requisitos previos

- Docker y Docker Compose
- Cuenta en TMDB para obtener API key

## Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/ferdef/movies.git
   cd Movies
   ```

2. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y configura:
   - `TMDB_API_KEY`: Tu API key de TMDB (obtén una en https://www.themoviedb.org/settings/api)
   - `JWT_SECRET`: Una clave secreta segura para JWT
   - Variables de PostgreSQL si quieres cambiar las credenciales por defecto

3. **Inicia la aplicación**:
   ```bash
   docker-compose up -d
   ```

4. **Accede a la aplicación**:
   - Abre tu navegador en `http://localhost`
   - Crea una cuenta nueva o inicia sesión

## Solución de problemas

### Problemas de conexión a la base de datos

Si el backend falla al conectar con PostgreSQL:

1. **Ejecuta el diagnóstico**:
   ```bash
   ./scripts/diagnose.sh
   ```

2. **Verifica los logs**:
   ```bash
   docker-compose logs postgres
   docker-compose logs backend
   ```

3. **Reinicia los servicios**:
   ```bash
   docker-compose restart
   ```

4. **Limpieza completa** (si persisten los problemas):
   ```bash
   docker-compose down -v
   docker system prune -f
   ./scripts/setup.sh
   ```

### Variables de entorno

Asegúrate de que tu archivo `.env` esté configurado correctamente:

```env
TMDB_API_KEY=tu_clave_real_de_tmdb
JWT_SECRET=una_clave_secreta_muy_segura_de_al_menos_32_caracteres
POSTGRES_DB=movies_app
POSTGRES_USER=movies_user
POSTGRES_PASSWORD=movies_password
```

## Configuración para Portainer/SWAG

### Para usar con SWAG:

1. **Configura el dominio en SWAG**: Añade tu dominio a la configuración de SWAG

2. **Actualiza nginx.conf**: Modifica `nginx/nginx.conf` para usar los certificados de SWAG:
   ```nginx
   ssl_certificate /etc/nginx/ssl/live/tudominio.com/fullchain.pem;
   ssl_certificate_key /etc/nginx/ssl/live/tudominio.com/privkey.pem;
   ```

3. **Volúmenes compartidos**: Monta los certificados de SWAG en el contenedor de nginx:
   ```yaml
   volumes:
     - /path/to/swag/etc/letsencrypt:/etc/nginx/ssl:ro
   ```

### Para Portainer:

1. **Crea un stack** en Portainer con el contenido de `docker-compose.yml`

2. **Variables de entorno**: Configura las variables de entorno en Portainer

3. **Red**: Asegúrate de que esté en la misma red que SWAG si usas proxy reverso

## Uso

### Funcionalidades principales:

1. **Buscar contenido**: Usa la página de búsqueda para encontrar películas y series
2. **Marcar como visto directamente**: Haz clic en el botón ✅ para marcar cualquier contenido como visto al instante
3. **Añadir a lista para más tarde**: Haz clic en el botón "+" para añadir contenido a tu lista personal (opcional)
4. **Valorar contenido**: Da me gusta 👍 o no me gusta 👎 al contenido que has visto
5. **Episodios de series**: Para series, puedes marcar episodios o temporadas completas
6. **Recomendaciones**: Explora recomendaciones basadas en tus gustos o filtros personalizados

### Flujo de uso mejorado:

- **Opción 1**: Marca directamente como visto 👁️ → Valora 👍👎 (sin añadir a lista)
- **Opción 2**: Añade a lista ➕ → Marca como visto 👁️ → Valora 👍👎 (para ver más tarde)
- **Series**: Gestiona episodios y temporadas individuales 📺
- **Recomendaciones**: Se basan en todo el contenido que has marcado como "me gusta"

### Indicadores visuales:

- **🟢 Borde verde**: Contenido marcado como visto
- **🟠 Borde naranja**: Contenido que te gusta
- **🔴 Borde rojo**: Contenido que no te gusta
- **👁️ Icono en esquina**: Estado del contenido
- **Botones con colores sólidos**: Estado activo claramente visible

### Gestión avanzada de series:

- **Episodio individual**: Marca un episodio específico como visto
- **Temporada completa**: Marca toda una temporada como vista
- **Serie completa**: Marca todas las temporadas como vistas
- **Vista detallada**: Modal con todos los episodios organizados por temporada

### Filtros de recomendaciones:

- **Por año**: Filtra por rango de años de lanzamiento
- **Por valoración**: Establece valoración mínima y máxima
- **Por género**: Incluye o excluye géneros específicos
- **Personalizadas**: Basadas en tu historial de "me gusta"

## Estructura del proyecto

```
Movies/
├── backend/                 # API Node.js/Express
│   ├── config/             # Configuración de base de datos
│   ├── models/             # Modelos de Sequelize
│   ├── routes/             # Rutas de la API
│   ├── middleware/         # Middleware de autenticación
│   └── services/           # Servicios (TMDB API)
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios de API
│   │   └── context/        # Contexto de autenticación
├── nginx/                  # Configuración de Nginx
└── docker-compose.yml     # Configuración de Docker
```

## API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Películas y Series
- `GET /movies/search` - Buscar contenido
- `GET /movies/popular/movies` - Películas populares
- `GET /movies/popular/tv` - Series populares
- `GET /movies/movie/:id` - Detalles de película
- `GET /movies/tv/:id` - Detalles de serie

### Lista personal
- `GET /watchlist` - Obtener lista del usuario
- `POST /watchlist/add` - Añadir a la lista
- `PUT /watchlist/:id/watch` - Marcar como visto
- `PUT /watchlist/:id/like` - Valorar contenido
- `DELETE /watchlist/:id` - Eliminar de la lista

### Recomendaciones
- `GET /recommendations` - Recomendaciones con filtros
- `GET /recommendations/based-on-likes` - Recomendaciones personalizadas

## Desarrollo

Para desarrollo local:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Seguridad

- ✅ Autenticación JWT
- ✅ Validación de entrada
- ✅ Rate limiting
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Passwords hasheadas con bcrypt
- ✅ Variables de entorno para secretos

## Licencia

Proyecto personal - Uso libre

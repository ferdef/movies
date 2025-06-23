#!/bin/bash

# Script de configuración inicial para Movies Tracker

set -e

echo "🎬 Configurando Movies Tracker..."

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor edita el archivo .env con tu API key de TMDB y otros valores"
    echo "   Puedes obtener tu API key en: https://www.themoviedb.org/settings/api"
    read -p "Presiona Enter cuando hayas configurado el archivo .env..."
fi

# Crear directorio SSL si no existe
mkdir -p nginx/ssl

# Generar certificados auto-firmados para desarrollo si no existen
if [ ! -f nginx/ssl/cert.pem ]; then
    echo "🔐 Generando certificados SSL para desarrollo..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=ES/ST=Madrid/L=Madrid/O=MoviesTracker/CN=localhost"
    echo "✅ Certificados SSL generados"
fi

# Verificar que las variables necesarias están configuradas
source .env

if [ -z "$TMDB_API_KEY" ] || [ "$TMDB_API_KEY" = "tu_api_key_aqui" ]; then
    echo "❌ Por favor configura TMDB_API_KEY en el archivo .env"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "tu_jwt_secret_muy_seguro_aqui" ]; then
    echo "❌ Por favor configura JWT_SECRET en el archivo .env"
    exit 1
fi

echo "🐳 Iniciando servicios con Docker Compose..."

# Limpiar contenedores anteriores si existen
if docker-compose ps -q | grep -q .; then
    echo "🧹 Limpiando contenedores anteriores..."
    docker-compose down
fi

# Construir e iniciar servicios
echo "🔨 Construyendo e iniciando servicios..."
docker-compose up -d --build

echo "⏳ Esperando que PostgreSQL esté listo..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker exec movies_db pg_isready -U movies_user -d movies_app >/dev/null 2>&1; then
        echo "✅ PostgreSQL está listo"
        break
    fi
    echo "Esperando PostgreSQL... ($((counter + 5))s/$timeout)"
    sleep 5
    counter=$((counter + 5))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Timeout esperando PostgreSQL"
    echo "Ejecuta './scripts/diagnose.sh' para más información"
    exit 1
fi

echo "⏳ Esperando que el backend esté listo..."
sleep 15

# Verificar que los servicios están corriendo
if docker-compose ps | grep -q "Up"; then
    echo "✅ Servicios iniciados correctamente"
    echo ""
    echo "🎉 Movies Tracker está listo!"
    echo ""
    echo "📍 Accede a la aplicación en:"
    echo "   🔗 http://localhost (desarrollo)"
    echo "   🔗 https://localhost (con SSL)"
    echo ""
    echo "📊 Panel de administración de Docker:"
    echo "   🔗 docker-compose logs -f (ver logs)"
    echo "   🔗 docker-compose down (detener)"
    echo ""
    echo "🔧 Para producción:"
    echo "   🔗 Usa docker-compose.prod.yml"
    echo "   🔗 Configura nginx/nginx.prod.conf para tu dominio"
    echo ""
else
    echo "❌ Error: Algunos servicios no están funcionando correctamente"
    echo "Revisa los logs con: docker-compose logs"
    exit 1
fi
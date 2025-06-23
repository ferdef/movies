#!/bin/bash

# Script de diagnóstico para Movies Tracker

echo "🔍 Diagnóstico de Movies Tracker"
echo "================================"

# Verificar que Docker está funcionando
echo "📦 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
else
    echo "✅ Docker está instalado: $(docker --version)"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
else
    echo "✅ Docker Compose está instalado: $(docker-compose --version)"
fi

# Verificar archivo .env
echo ""
echo "⚙️  Verificando configuración..."
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado"
    echo "   Ejecuta: cp .env.example .env"
    exit 1
else
    echo "✅ Archivo .env encontrado"
    
    # Verificar variables críticas
    source .env
    
    if [ -z "$TMDB_API_KEY" ] || [ "$TMDB_API_KEY" = "tu_api_key_aqui" ]; then
        echo "❌ TMDB_API_KEY no configurado correctamente"
        echo "   Obtén tu API key en: https://www.themoviedb.org/settings/api"
    else
        echo "✅ TMDB_API_KEY configurado"
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "tu_jwt_secret_muy_seguro_aqui" ]; then
        echo "❌ JWT_SECRET no configurado correctamente"
        echo "   Configura una clave secreta segura"
    else
        echo "✅ JWT_SECRET configurado"
    fi
fi

# Verificar estado de contenedores
echo ""
echo "🐳 Estado de contenedores..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Algunos contenedores están ejecutándose"
    docker-compose ps
else
    echo "⚠️  No hay contenedores ejecutándose"
fi

# Verificar logs de contenedores
echo ""
echo "📋 Últimos logs del backend..."
docker-compose logs --tail=20 backend

echo ""
echo "📋 Últimos logs de PostgreSQL..."
docker-compose logs --tail=10 postgres

# Verificar conectividad de red
echo ""
echo "🌐 Verificando conectividad..."

# Test de salud del backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend responde en puerto 3001"
else
    echo "❌ Backend no responde en puerto 3001"
fi

# Test de PostgreSQL
if docker exec movies_db pg_isready -U movies_user -d movies_app > /dev/null 2>&1; then
    echo "✅ PostgreSQL está disponible"
else
    echo "❌ PostgreSQL no está disponible"
fi

# Verificar puertos
echo ""
echo "🔌 Puertos en uso..."
if netstat -tuln 2>/dev/null | grep -E ":(80|443|3000|3001|5432)"; then
    echo "Puertos detectados arriba"
else
    echo "⚠️  Comando netstat no disponible, usando ss"
    ss -tuln | grep -E ":(80|443|3000|3001|5432)"
fi

# Comandos útiles
echo ""
echo "🛠️  Comandos útiles para solucionar problemas:"
echo "   📄 Ver logs: docker-compose logs -f [servicio]"
echo "   🔄 Reiniciar: docker-compose restart [servicio]"
echo "   🛑 Detener: docker-compose down"
echo "   🗑️  Limpiar: docker-compose down -v && docker system prune"
echo "   🔧 Reconstruir: docker-compose up --build -d"
echo ""
echo "🆘 Si persisten los problemas:"
echo "   1. Verifica que los puertos no estén en uso"
echo "   2. Revisa los logs completos: docker-compose logs"
echo "   3. Reinicia Docker completamente"
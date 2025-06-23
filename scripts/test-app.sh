#!/bin/bash

# Script para probar la funcionalidad básica de Movies Tracker

echo "🧪 Probando Movies Tracker..."
echo "=============================="

# Verificar que todos los servicios están corriendo
echo "📦 Verificando servicios..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Los servicios no están ejecutándose"
    echo "Ejecuta: docker-compose up -d"
    exit 1
fi

echo "✅ Servicios ejecutándose"

# Probar backend
echo ""
echo "🔧 Probando backend..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "OK"; then
    echo "✅ Backend funcionando: $HEALTH"
else
    echo "❌ Backend no responde correctamente"
    exit 1
fi

# Probar frontend
echo ""
echo "🌐 Probando frontend..."
if curl -s http://localhost:3000 | grep -q "Movies Tracker"; then
    echo "✅ Frontend funcionando"
else
    echo "❌ Frontend no responde correctamente"
    exit 1
fi

# Probar registro de usuario
echo ""
echo "👤 Probando registro de usuario..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"testuser$TIMESTAMP\",\"email\":\"test$TIMESTAMP@test.com\",\"password\":\"123456\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo "✅ Registro de usuario funcionando"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Error en registro de usuario: $REGISTER_RESPONSE"
    exit 1
fi

# Probar añadir película a watchlist
echo ""
echo "📽️  Probando añadir película a watchlist..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:3001/watchlist/add \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"tmdb_id":550,"media_type":"movie","title":"Fight Club","poster_path":"/test.jpg","release_date":"1999-10-15"}')

if echo "$ADD_RESPONSE" | grep -q "Fight Club"; then
    echo "✅ Añadir a watchlist funcionando"
    ITEM_ID=$(echo "$ADD_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
else
    echo "❌ Error añadiendo a watchlist: $ADD_RESPONSE"
    exit 1
fi

# Probar marcar como visto
echo ""
echo "✅ Probando marcar como visto..."
WATCH_RESPONSE=$(curl -s -X PUT "http://localhost:3001/watchlist/$ITEM_ID/watch" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"watched":true}')

if echo "$WATCH_RESPONSE" | grep -q '"watched":true'; then
    echo "✅ Marcar como visto funcionando"
else
    echo "❌ Error marcando como visto: $WATCH_RESPONSE"
    exit 1
fi

# Probar valoración
echo ""
echo "👍 Probando valoración..."
LIKE_RESPONSE=$(curl -s -X PUT "http://localhost:3001/watchlist/$ITEM_ID/like" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"liked":true}')

if echo "$LIKE_RESPONSE" | grep -q '"liked":true'; then
    echo "✅ Valoración funcionando"
else
    echo "❌ Error en valoración: $LIKE_RESPONSE"
    exit 1
fi

# Probar gestión de episodios (añadir una serie)
echo ""
echo "📺 Probando gestión de episodios..."
TV_RESPONSE=$(curl -s -X POST http://localhost:3001/watchlist/add \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"tmdb_id":1399,"media_type":"tv","title":"Game of Thrones","poster_path":"/test.jpg","release_date":"2011-04-17"}')

if echo "$TV_RESPONSE" | grep -q "Game of Thrones"; then
    echo "✅ Serie añadida a watchlist"
    TV_ID=$(echo "$TV_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    
    # Marcar serie como vista
    curl -s -X PUT "http://localhost:3001/watchlist/$TV_ID/watch" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"watched":true}' > /dev/null
    
    # Probar marcar episodio como visto
    EPISODE_RESPONSE=$(curl -s -X POST http://localhost:3001/watchlist/episodes/watch \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"tmdb_show_id":1399,"season_number":1,"episode_number":1,"watched":true}')
    
    if echo "$EPISODE_RESPONSE" | grep -q '"watched":true'; then
        echo "✅ Gestión de episodios funcionando"
    else
        echo "❌ Error en gestión de episodios: $EPISODE_RESPONSE"
    fi
else
    echo "❌ Error añadiendo serie: $TV_RESPONSE"
fi

echo ""
echo "🎉 ¡Todas las pruebas pasaron exitosamente!"
echo ""
echo "📍 Accede a la aplicación en:"
echo "   🔗 Frontend: http://localhost:3000"
echo "   🔗 API: http://localhost:3001"
echo "   🔗 A través de Nginx: http://localhost"
echo ""
echo "👤 Usuario de prueba creado:"
echo "   📧 Email: test$TIMESTAMP@test.com"
echo "   🔑 Password: 123456"
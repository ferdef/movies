require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const watchlistRoutes = require('./routes/watchlist');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/movies', moviesRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/recommendations', recommendationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

const waitForDatabase = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Intentando conectar a la base de datos (intento ${i + 1}/${retries})...`);
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida');
      return;
    } catch (error) {
      console.error(`❌ Error de conexión a la base de datos (intento ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      console.log(`Reintentando en ${delay / 1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'No configurado');
    console.log('TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'Configurado' : 'No configurado');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
    
    await waitForDatabase();
    
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Health check disponible en http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('💥 Error crítico al iniciar el servidor:', error);
    console.error('Verifique que:');
    console.error('1. PostgreSQL esté ejecutándose');
    console.error('2. Las variables de entorno estén configuradas');
    console.error('3. La red de Docker esté funcionando');
    process.exit(1);
  }
};

startServer();
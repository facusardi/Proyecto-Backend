const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://proyecto-frontend-ls.onrender.com',
    'http://localhost:5173',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

console.log('[Server] Starting backend...');

// Importar rutas
try {
  const authRoutes = require('./routes/authRoutes');
  const dataRoutes = require('./routes/dataRoutes');
  const interesesRoutes = require('./routes/InteresesRoutes'); // 🔥 NUEVA LÍNEA
  
  console.log('[Server] Routes imported successfully')
  
  // Montar rutas
  app.use('/api/auth', authRoutes);
  app.use('/api', dataRoutes);
  app.use('/api/intereses', interesesRoutes); // 🔥 NUEVA LÍNEA
  
  console.log('[Server] Routes mounted at:')
  console.log('  - /api/auth')
  console.log('  - /api')
  console.log('  - /api/intereses') // 🔥 NUEVA LÍNEA
} catch (err) {
  console.error('[Server] Error loading routes:', err.message)
  process.exit(1)
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// 404 handler (debe ir al final)
app.use((req, res) => {
  console.warn(`[Server] 404 - ${req.method} ${req.originalUrl}`)
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`[Server] ✓ Listening on port ${PORT}`)
  console.log(`[Server] Available endpoints:`)
  console.log(`  POST http://localhost:${PORT}/api/auth/register`)
  console.log(`  POST http://localhost:${PORT}/api/auth/login`)
  console.log(`  GET  http://localhost:${PORT}/api/intereses/user/:userId`)
  console.log(`  POST http://localhost:${PORT}/api/intereses/user/:userId`)
  console.log(`  GET  http://localhost:${PORT}/api/intereses/tipos`)
})
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('[Server] Starting backend...');

// Importar rutas
try {
  const authRoutes = require('./routes/authRoutes');
  const dataRoutes = require('./routes/dataRoutes');
  
  console.log('[Server] Routes imported successfully')
  
  // Montar rutas
  app.use('/api/auth', authRoutes);
  app.use('/api', dataRoutes);
  
  console.log('[Server] Routes mounted at /api/auth and /api')
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
  console.log(`[Server] POST http://localhost:${PORT}/api/auth/register should work`)
})
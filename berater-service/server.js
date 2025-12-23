require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const meterRoutes = require('./src/routes/meterRoutes');
const contractRoutes = require('./src/routes/contractRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const upgradeRoutes = require('./src/routes/upgradeRoutes');
const messageRoutes = require('./src/routes/messagesRoutee');

const app = express();
app.set('trust proxy', 1);

// 🔐 Security
app.use(helmet());

// 🌍 CORS
app.use(cors({
  origin: ['http://berater.eskapp.com', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📦 Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🗜 Compression
app.use(compression());

// 📝 Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ⛓ Rate Limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Login-Versuche
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// 🔓 AUTH (separat & locker)
app.use('/api/auth', authLimiter, authRoutes);

// 🔒 REST API (global)
app.use('/api', apiLimiter);

// 🔗 API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/messages', messageRoutes);

// 📊 Dashboard
const { getDashboardStats } = require('./src/controllers/reminderController');
const { authenticate } = require('./src/middleware/auth');
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// ❤️ Health
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ❌ 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route nicht gefunden'
  });
});

// 💥 Error Handler
app.use(errorHandler);

// 🚀 Start
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// 🛑 Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen – Server stoppt');
  server.close();
});

module.exports = app;

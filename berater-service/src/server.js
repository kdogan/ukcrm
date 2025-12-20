require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const meterRoutes = require('./routes/meterRoutes');
const contractRoutes = require('./routes/contractRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const todoRoutes = require('./routes/todoRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Initialize Cron Jobs
const { initializeJobs } = require('./jobs/todoJobs');
initializeJobs();

// Security Middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: 'Zu viele Anfragen, bitte später erneut versuchen'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);

// Dashboard route (separate from reminders)
const { getDashboardStats } = require('./controllers/reminderController');
const { authenticate } = require('./middleware/auth');
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route nicht gefunden'
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT} im ${process.env.NODE_ENV || 'development'} Modus`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal empfangen: Server wird heruntergefahren');
  server.close(() => {
    console.log('HTTP Server geschlossen');
  });
});

module.exports = app;

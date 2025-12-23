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

const { initializeJobs } = require('./src/jobs/todoJobs');
const { getDashboardStats } = require('./src/controllers/reminderController');
const { authenticate } = require('./src/middleware/auth');

const app = express();

// ✅ Trust Proxy (wenn hinter Nginx/Cloudflare)
app.set('trust proxy', 1);

// 🔗 Connect DB
connectDB();

// 🔐 Security
app.use(helmet());

// 🌍 CORS
app.use(cors({
  origin: ['http://berater.eskapp.com', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 📦 Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🗜 Compression
app.use(compression());

// 📝 Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ⛓ Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 50, // max 50 Requests pro IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Zu viele Login-Versuche, bitte später erneut versuchen."
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // max 100 Requests pro IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Zu viele Anfragen, bitte später erneut versuchen."
});

// 🔓 Auth Routen locker limitiert
app.use('/api/auth', authLimiter, authRoutes);

// 🔒 REST API Routen (alle anderen)
app.use('/api/customers', apiLimiter, customerRoutes);
app.use('/api/meters', apiLimiter, meterRoutes);
app.use('/api/contracts', apiLimiter, contractRoutes);
app.use('/api/reminders', apiLimiter, reminderRoutes);
app.use('/api/suppliers', apiLimiter, supplierRoutes);
app.use('/api/todos', apiLimiter, todoRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/packages', apiLimiter, packageRoutes);
app.use('/api/upgrade', apiLimiter, upgradeRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);

// 📊 Dashboard Route
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// ❤️ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 🔄 Initialize Cron Jobs
initializeJobs();

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route nicht gefunden' });
});

// 💥 Global Error Handler
app.use(errorHandler);

// 🚀 Start Server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// 🛑 Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen – Server stoppt');
  server.close(() => console.log('HTTP Server geschlossen'));
});

module.exports = app;

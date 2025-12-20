const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'E-Mail ist erforderlich'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte gültige E-Mail eingeben']
  },
  passwordHash: {
    type: String,
    required: [true, 'Passwort ist erforderlich'],
    minlength: 8
  },
  firstName: {
    type: String,
    required: [true, 'Vorname ist erforderlich'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Nachname ist erforderlich'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['berater', 'admin', 'superadmin'],
    default: 'berater'
  },
  package: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    trim: true
  },
  blockedAt: {
    type: Date
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  packageLimits: {
    maxCustomers: { type: Number, default: 50 },
    maxContracts: { type: Number, default: 100 },
    maxMeters: { type: Number, default: 50 }
  },
  lastLogin: {
    type: Date
  },
  settings: {
    reminderDays: {
      days90: { type: Boolean, default: true },
      days60: { type: Boolean, default: true },
      days30: { type: Boolean, default: true },
      custom: { type: Number }
    },
    sidebarLabels: {
      dashboard: { type: String, default: 'Dashboard' },
      customers: { type: String, default: 'Kunden' },
      meters: { type: String, default: 'Zähler' },
      contracts: { type: String, default: 'Verträge' },
      todos: { type: String, default: 'TODOs' },
      suppliers: { type: String, default: 'Anbieter' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: false }
    },
    theme: {
      sidebarColor: { type: String, default: 'mint' }
    }
  }
}, {
  timestamps: true
});

// Index für schnelle Suche
userSchema.index({ email: 1 });

// Passwort hashen vor dem Speichern
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methode zum Passwort-Vergleich
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Passwort aus JSON-Output entfernen
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

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
    enum: ['berater', 'admin'],
    default: 'berater'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
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

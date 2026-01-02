const mongoose = require('mongoose');

const educationMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titel ist erforderlich'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'document', 'link', 'image'],
    required: [true, 'Typ ist erforderlich']
  },
  url: {
    type: String,
    required: [true, 'URL ist erforderlich'],
    trim: true
  },
  // Für YouTube Videos
  videoId: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  // Master Berater, der das Material erstellt hat
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ersteller ist erforderlich']
  },
  // Berater, die Zugriff auf dieses Material haben
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Kategorien für Organisation
  category: {
    type: String,
    enum: ['onboarding', 'training', 'product-info', 'sales', 'support', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Sichtbarkeit
  isPublic: {
    type: Boolean,
    default: false // nur für zugewiesene Berater sichtbar
  },
  // Statistiken
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Sortierung
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index für schnelle Suche
educationMaterialSchema.index({ createdBy: 1, isActive: 1 });
educationMaterialSchema.index({ sharedWith: 1, isActive: 1 });
educationMaterialSchema.index({ category: 1, isActive: 1 });

// Virtuelle Eigenschaft für YouTube Embed URL
educationMaterialSchema.virtual('embedUrl').get(function() {
  if (this.type === 'video' && this.videoId) {
    return `https://www.youtube.com/embed/${this.videoId}`;
  }
  return null;
});

// Methode um YouTube Video ID aus URL zu extrahieren
educationMaterialSchema.methods.extractYouTubeId = function(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Pre-save hook um YouTube Video ID zu extrahieren
educationMaterialSchema.pre('save', function(next) {
  if (this.type === 'video' && this.url && !this.videoId) {
    this.videoId = this.extractYouTubeId(this.url);
    if (this.videoId && !this.thumbnail) {
      this.thumbnail = `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
    }
  }
  next();
});

// Methode um View zu registrieren
educationMaterialSchema.methods.registerView = async function(userId) {
  // Prüfen ob User bereits gesehen hat
  const alreadyViewed = this.viewedBy.some(v => v.userId.toString() === userId.toString());

  if (!alreadyViewed) {
    this.viewedBy.push({ userId, viewedAt: new Date() });
  }

  this.views += 1;
  await this.save();
};

const EducationMaterial = mongoose.model('EducationMaterial', educationMaterialSchema);

module.exports = EducationMaterial;

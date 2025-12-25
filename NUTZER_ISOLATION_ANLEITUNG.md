# Nutzer-Isolation Implementierungsanleitung

## Übersicht
Diese Anleitung zeigt, wie Sie die Datenisolation für jeden Benutzer implementieren, sodass Benutzer nur ihre eigenen Daten sehen und bearbeiten können.

## Status der Implementierung

### ✅ Bereits implementiert
Die folgenden Modelle haben bereits `beraterId`-Filterung:
- **Customer** (Kunden)
- **Contract** (Verträge)
- **Meter** (Zähler)
- **Todo** (Aufgaben)

### ❌ Noch zu implementieren
- **Supplier** (Anbieter) - Hat kein `beraterId`-Feld
- **Settings** (Einstellungen) - Muss geprüft werden

---

## 1. Supplier-Modell anpassen

**Datei:** `berater-service/src/models/Supplier.js`

### Änderung hinzufügen:
```javascript
const supplierSchema = new mongoose.Schema({
  // NEU: beraterId hinzufügen
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name ist erforderlich'],
    trim: true
  },
  // ... rest bleibt gleich
});

// NEU: Index hinzufügen
supplierSchema.index({ beraterId: 1, isActive: 1 });
```

---

## 2. Supplier-Controller anpassen

**Datei:** `berater-service/src/controllers/supplierController.js`

### A) getSuppliers - Liste filtern
```javascript
exports.getSuppliers = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;

    // NEU: Nur eigene Supplier
    const filter = { beraterId: req.user._id };

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    const total = await Supplier.countDocuments(filter);

    const suppliers = await Supplier.find(filter)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### B) getSupplier - Einzelnen Anbieter prüfen
```javascript
exports.getSupplier = async (req, res, next) => {
  try {
    // NEU: Prüfe beraterId
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
```

### C) createSupplier - beraterId setzen
```javascript
exports.createSupplier = async (req, res, next) => {
  try {
    // NEU: beraterId automatisch setzen
    const supplierData = {
      ...req.body,
      beraterId: req.user._id
    };

    const supplier = await Supplier.create(supplierData);

    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
```

### D) updateSupplier - Berechtigung prüfen
```javascript
exports.updateSupplier = async (req, res, next) => {
  try {
    // NEU: Prüfe Berechtigung
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    // Update durchführen
    Object.assign(supplier, req.body);
    await supplier.save();

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
```

### E) deleteSupplier - Berechtigung prüfen
```javascript
exports.deleteSupplier = async (req, res, next) => {
  try {
    // NEU: Prüfe Berechtigung
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    await supplier.remove();

    res.status(200).json({
      success: true,
      message: 'Anbieter gelöscht'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 3. Routen-Middleware anpassen

**Datei:** `berater-service/src/routes/supplierRoutes.js` (oder wo Supplier-Routen definiert sind)

### Aktuell (vermutlich):
```javascript
router.put('/:id', authorize('admin'), updateSupplier);
```

### Ändern zu:
```javascript
// Alle authentifizierten Nutzer dürfen ihre eigenen Supplier bearbeiten
router.put('/:id', protect, updateSupplier);
```

**Entfernen Sie** `authorize('admin')` von allen Supplier-Routen!

---

## 4. Datenbank-Migration

Nach den Code-Änderungen müssen Sie **bestehende Supplier** einem Benutzer zuweisen:

### Option A: Alle einem Admin zuweisen
```javascript
// Migration Script
const User = require('./models/User');
const Supplier = require('./models/Supplier');

async function migrateSuppliers() {
  // Finde einen Admin
  const admin = await User.findOne({ role: 'superadmin' });

  if (!admin) {
    console.error('Kein Admin gefunden!');
    return;
  }

  // Update alle Supplier ohne beraterId
  const result = await Supplier.updateMany(
    { beraterId: { $exists: false } },
    { $set: { beraterId: admin._id } }
  );

  console.log(`${result.modifiedCount} Supplier aktualisiert`);
}
```

### Option B: Jeden Benutzer eigene Supplier erstellen lassen
Löschen Sie alle bestehenden Supplier und lassen Sie Benutzer neue erstellen.

---

## 5. Testing

### Test-Schritte:
1. **Als Benutzer A einloggen**
   - Supplier erstellen
   - Liste sollte nur eigene Supplier zeigen

2. **Als Benutzer B einloggen**
   - Liste sollte LEER sein (oder nur eigene Supplier)
   - Versuch, Supplier von A zu bearbeiten → 404 Fehler

3. **Als Superadmin einloggen**
   - Sollte alle Supplier sehen können (falls gewünscht)

---

## 6. Frontend-Anpassungen

Das Frontend ist bereits korrekt - es ruft einfach die API auf. Die API kümmert sich um die Filterung.

**Keine Änderungen nötig!** ✅

---

## Zusammenfassung

### Änderungen erforderlich:
1. ✅ Supplier-Modell: `beraterId` hinzufügen
2. ✅ Supplier-Controller: Alle Methoden anpassen
3. ✅ Supplier-Routes: `authorize('admin')` entfernen
4. ✅ Datenbank-Migration durchführen

### Zeitaufwand:
- Code-Änderungen: ~30 Minuten
- Testing: ~15 Minuten
- **Gesamt: ~45 Minuten**

---

## Sicherheitsvorteile

Nach dieser Implementierung:
- ✅ Jeder Benutzer sieht nur seine eigenen Daten
- ✅ Kein Benutzer kann Daten anderer Benutzer ändern
- ✅ API ist gegen unbefugte Zugriffe geschützt
- ✅ DSGVO-konform (Datenisolation)

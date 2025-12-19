# Berater-App für Energie-/Elektrik-Beratung

Eine vollständige Full-Stack-Anwendung zur Unterstützung von Energie- und Elektrik-Beratern.

## 🎯 Überblick

Die Berater-App hilft Beratern bei:
- Kunden- und Vertragsverwaltung
- Zähler-Tracking mit vollständiger Historie
- Automatischen Erinnerungen für auslaufende Verträge
- Übersichtlichem Dashboard mit Kennzahlen

## 🏗️ Technologie-Stack

**Backend:** Node.js, Express.js, MongoDB, JWT  
**Frontend:** Angular 17, TypeScript, SCSS  
**DevOps:** Docker, Docker Compose

## 🚀 Schnellstart mit Docker

```bash
# Repository klonen
cd berater-app

# Umgebungsvariablen konfigurieren
cp backend/.env.example backend/.env

# Alle Services starten
docker-compose up -d
```

Anwendung verfügbar unter: http://localhost:4200  
Backend API: http://localhost:3000

## 🔐 Erste Schritte

1. **Admin-Benutzer erstellen:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beispiel.de",
    "password": "SicheresPasswort123!",
    "firstName": "Max",
    "lastName": "Mustermann",
    "role": "admin"
  }'
```

2. **Anmelden:** Öffnen Sie http://localhost:4200

3. **Anbieter anlegen:** Als Admin können Sie Energieversorger hinzufügen

## 📁 Projektstruktur

```
berater-app/
├── backend/              # Node.js Backend
│   ├── src/
│   │   ├── models/      # Mongoose Modelle
│   │   ├── routes/      # API Routen
│   │   └── middleware/  # Auth & Error Handling
│   └── package.json
├── frontend/            # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI Komponenten
│   │   │   ├── services/    # HTTP Services
│   │   │   └── interceptors/# JWT Interceptor
│   │   └── environments/
│   └── package.json
└── docker-compose.yml   # Docker Setup
```

## 🔑 Hauptfunktionen

### Kundenverwaltung
- Kunden anlegen, bearbeiten, deaktivieren
- Suchfunktion und Filter
- Audit-Log für Änderungen

### Zählerverwaltung
- Eindeutige Zählernummern
- Vollständige Historie aller Zuordnungen
- Zeitbasierte Tracking (wer, wann, welcher Vertrag)

### Vertragsverwaltung
- Verträge mit Kunden, Zählern und Anbietern verknüpfen
- Automatische Endtermin-Berechnung
- Status-Verwaltung (aktiv, beendet, archiviert)

### Erinnerungssystem
- Automatische Erinnerungen 90/60/30 Tage vor Vertragsende
- Dashboard-Integration
- Status-Tracking (offen, erledigt)

### Dashboard
- Auslaufende Verträge im Überblick
- Verträge nach Anbieter
- Kunden- und Zählerstatistiken
- Priorisierte Erinnerungen

## 🔒 Sicherheit

- JWT-Authentifizierung mit Refresh-Token
- bcrypt Password-Hashing (12 Rounds)
- CORS-Konfiguration
- Input-Validierung
- Rollenbasierte Zugriffskontrolle

## 📊 API-Endpunkte

**Auth:** /api/auth/login, /api/auth/register  
**Kunden:** /api/customers  
**Zähler:** /api/meters, /api/meters/:id/history  
**Verträge:** /api/contracts  
**Dashboard:** /api/dashboard/stats  
**Erinnerungen:** /api/reminders

Vollständige API-Dokumentation siehe Pflichtenheft.

## 🛠️ Entwicklung

### Backend lokal starten:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend lokal starten:
```bash
cd frontend
npm install
ng serve
```

## 📝 Geschäftsregeln

1. Zähler darf nie mehreren Kunden gleichzeitig zugeordnet sein
2. Vertrag muss genau einem Anbieter zugeordnet sein
3. Historische Daten sind unveränderlich
4. Berater sehen nur eigene Daten

## 🔜 Roadmap (Phase 2)

- E-Mail-Benachrichtigungen
- Dokumenten-Upload
- Erweiterte Reports
- Mobile App

## 📄 Lizenz

Proprietär - Interne Nutzung

---

**Version:** 1.0.0 | **Erstellt:** Dezember 2025

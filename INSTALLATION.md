# 📦 Installationsanleitung - Berater-App

## Systemanforderungen

- **Docker Desktop** (empfohlen) ODER:
- Node.js 20+
- MongoDB 7+
- npm

## ⚡ Schnellinstallation mit Docker (Empfohlen)

### Schritt 1: Docker installieren

Falls noch nicht vorhanden:
- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** `sudo apt-get install docker.io docker-compose`

### Schritt 2: Projekt entpacken

```bash
cd berater-app
```

### Schritt 3: Umgebungsvariablen konfigurieren

```bash
# Backend .env erstellen
cp backend/.env.example backend/.env

# WICHTIG: Öffnen Sie backend/.env und ändern Sie:
JWT_SECRET=ihr-sicherer-geheimer-schluessel-hier
```

### Schritt 4: Anwendung starten

```bash
# Option A: Mit Schnellstart-Skript
./start.sh

# Option B: Manuell
docker-compose up -d
```

### Schritt 5: Admin-Benutzer erstellen

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

### Schritt 6: Anmelden

Öffnen Sie http://localhost:4200 und melden Sie sich an!

## 🔧 Manuelle Installation (ohne Docker)

### Backend Setup

```bash
cd backend

# 1. Dependencies installieren
npm install

# 2. MongoDB starten (falls lokal installiert)
mongod

# 3. .env konfigurieren
cp .env.example .env
# Bearbeiten Sie .env und setzen Sie MONGODB_URI

# 4. Server starten
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

```bash
cd frontend

# 1. Dependencies installieren
npm install

# 2. Development Server starten
ng serve

# Frontend ist verfügbar unter http://localhost:4200
```

## 🎯 Nach der Installation

### 1. Erste Anmeldung

- URL: http://localhost:4200
- E-Mail: admin@beispiel.de
- Passwort: SicheresPasswort123!

### 2. Anbieter anlegen

Als Admin-Benutzer:
1. Navigieren Sie zu "Anbieter" (falls implementiert als Admin-Panel)
2. Fügen Sie Energieversorger hinzu:
   - E.ON
   - Vattenfall
   - EnBW
   - etc.

### 3. Erste Kunden anlegen

1. Gehen Sie zu "Kunden"
2. Klicken Sie auf "+ Neuer Kunde"
3. Füllen Sie das Formular aus

### 4. Zähler erstellen

1. Navigieren Sie zu "Zähler"
2. Erstellen Sie Zähler mit eindeutigen Nummern
3. Ordnen Sie Zähler Kunden zu

### 5. Verträge erfassen

1. Gehen Sie zu "Verträge"
2. Erstellen Sie neue Verträge
3. Verknüpfen Sie Kunde, Zähler und Anbieter

## 🔍 Troubleshooting

### Problem: Backend startet nicht

**Lösung:**
```bash
# Prüfen Sie MongoDB-Verbindung
docker-compose logs mongodb

# Prüfen Sie Backend-Logs
docker-compose logs backend

# Neustart
docker-compose restart backend
```

### Problem: Frontend lädt nicht

**Lösung:**
```bash
# Prüfen Sie Frontend-Logs
docker-compose logs frontend

# Cache leeren
docker-compose down
docker-compose up -d --build
```

### Problem: "CORS Error" im Browser

**Lösung:**
- Stellen Sie sicher, dass CORS_ORIGIN in backend/.env korrekt gesetzt ist
- Standard: `CORS_ORIGIN=http://localhost:4200`

### Problem: MongoDB-Verbindung fehlgeschlagen

**Lösung:**
```bash
# Prüfen Sie MongoDB
docker-compose ps

# MongoDB neu starten
docker-compose restart mongodb

# Warten Sie 10 Sekunden, dann Backend neu starten
docker-compose restart backend
```

## 🛑 Anwendung stoppen

```bash
# Alle Container stoppen
docker-compose down

# Container stoppen und Volumes löschen (ACHTUNG: Löscht Daten!)
docker-compose down -v
```

## 📊 Logs anzeigen

```bash
# Alle Logs
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend

# Nur MongoDB
docker-compose logs -f mongodb
```

## 🔄 Updates installieren

```bash
# Code aktualisieren
git pull

# Container neu bauen
docker-compose down
docker-compose up -d --build
```

## 🆘 Support

Bei Problemen:
1. Prüfen Sie die Logs: `docker-compose logs -f`
2. Überprüfen Sie die .env-Datei
3. Stellen Sie sicher, dass Ports 3000, 4200 und 27017 frei sind
4. Kontaktieren Sie das Entwicklungsteam

## 📚 Weitere Ressourcen

- README.md - Projekt-Übersicht
- Backend: `backend/src/` - Code-Struktur
- Frontend: `frontend/src/app/` - Angular-Komponenten
- API-Dokumentation: http://localhost:3000/health

---

**Viel Erfolg mit der Berater-App! 🚀**

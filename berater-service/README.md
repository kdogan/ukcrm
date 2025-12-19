# Berater-App Backend

Node.js Backend mit Express und MongoDB für die Berater-App.

## Installation

```bash
npm install
```

## Konfiguration

Erstelle eine `.env` Datei basierend auf `.env.example`:

```bash
cp .env.example .env
```

Passe die Werte in `.env` an:
- `MONGODB_URI`: MongoDB Connection String
- `JWT_SECRET`: Sicherer JWT Secret Key
- `CORS_ORIGIN`: Frontend URL

## Starten

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Dokumentation

### Authentifizierung

#### Login
```
POST /api/auth/login
Body: { email, password }
```

#### Get Current User
```
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Kunden

#### Alle Kunden
```
GET /api/customers?isActive=true&search=max&page=1&limit=20
```

#### Kunde erstellen
```
POST /api/customers
Body: { firstName, lastName, email, phone, address, notes }
```

### Zähler

#### Alle Zähler
```
GET /api/meters?type=electricity&isFree=true
```

#### Zähler-Historie
```
GET /api/meters/:id/history
```

#### Zähler zuordnen
```
POST /api/meters/:id/assign
Body: { customerId, startDate, contractId? }
```

### Verträge

#### Alle Verträge
```
GET /api/contracts?status=active&daysRemaining=90
```

#### Vertrag erstellen
```
POST /api/contracts
Body: {
  customerId,
  meterId,
  supplierId,
  startDate,
  durationMonths
}
```

### Dashboard

#### Statistiken
```
GET /api/dashboard/stats
```

## Datenbank-Seeding

Für Entwicklung und Tests kannst du Sample-Daten erstellen:

```bash
node src/scripts/seed.js
```

## Tests

```bash
npm test
```

## Technologie-Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.x
- **Datenbank**: MongoDB 7.x
- **ODM**: Mongoose 8.x
- **Authentifizierung**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Validierung**: express-validator

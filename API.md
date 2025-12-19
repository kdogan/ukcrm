# 🔌 API-Dokumentation - Berater-App

Base URL: `http://localhost:3000/api`

Alle geschützten Routen benötigen einen JWT-Token im Authorization-Header:
```
Authorization: Bearer <token>
```

## 🔐 Authentifizierung

### POST /auth/register
Neuen Benutzer registrieren

**Request Body:**
```json
{
  "email": "benutzer@beispiel.de",
  "password": "SicheresPasswort123!",
  "firstName": "Max",
  "lastName": "Mustermann",
  "phone": "+49 123 456789",
  "role": "berater"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Benutzer erfolgreich registriert",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "benutzer@beispiel.de",
    "fullName": "Max Mustermann"
  }
}
```

### POST /auth/login
Benutzer anmelden

**Request Body:**
```json
{
  "email": "benutzer@beispiel.de",
  "password": "SicheresPasswort123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Erfolgreich angemeldet",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "benutzer@beispiel.de",
      "fullName": "Max Mustermann",
      "role": "berater"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/refresh-token
Token erneuern

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
Aktuellen Benutzer abrufen (Protected)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "benutzer@beispiel.de",
    "firstName": "Max",
    "lastName": "Mustermann",
    "role": "berater"
  }
}
```

---

## 👥 Kunden

### GET /customers
Alle Kunden des Beraters abrufen (Protected)

**Query Parameters:**
- `isActive` (boolean) - Filter nach Status
- `search` (string) - Suche nach Name/E-Mail
- `page` (number) - Seitennummer (Standard: 1)
- `limit` (number) - Einträge pro Seite (Standard: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerNumber": "CUS000001",
      "firstName": "Anna",
      "lastName": "Schmidt",
      "email": "anna.schmidt@beispiel.de",
      "phone": "+49 123 456789",
      "isActive": true,
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

### GET /customers/:id
Einzelnen Kunden abrufen (Protected)

### POST /customers
Neuen Kunden anlegen (Protected)

**Request Body:**
```json
{
  "firstName": "Anna",
  "lastName": "Schmidt",
  "email": "anna.schmidt@beispiel.de",
  "phone": "+49 123 456789",
  "address": {
    "street": "Musterstraße 123",
    "zip": "12345",
    "city": "Berlin",
    "country": "Deutschland"
  },
  "notes": "Wichtiger Kunde"
}
```

### PUT /customers/:id
Kunden aktualisieren (Protected)

### PATCH /customers/:id/deactivate
Kunden deaktivieren (Protected)

---

## ⚡ Zähler

### GET /meters
Alle Zähler abrufen (Protected)

**Query Parameters:**
- `status` (string) - "free" oder "occupied"
- `type` (string) - "electricity", "gas", "water"
- `search` (string) - Suche nach Zählernummer

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "meterNumber": "Z123456789",
      "type": "electricity",
      "currentCustomerId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Anna",
        "lastName": "Schmidt",
        "customerNumber": "CUS000001"
      },
      "location": {
        "street": "Musterstraße 123",
        "zip": "12345",
        "city": "Berlin"
      }
    }
  ]
}
```

### GET /meters/:id/history
Zähler-Historie abrufen (Protected)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerId": {
        "firstName": "Anna",
        "lastName": "Schmidt",
        "customerNumber": "CUS000001"
      },
      "contractId": {
        "contractNumber": "CON000001"
      },
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z"
    }
  ]
}
```

### POST /meters
Neuen Zähler anlegen (Protected)

**Request Body:**
```json
{
  "meterNumber": "Z123456789",
  "type": "electricity",
  "location": {
    "street": "Musterstraße 123",
    "zip": "12345",
    "city": "Berlin"
  },
  "manufacturer": "Siemens",
  "yearBuilt": 2020
}
```

### POST /meters/:id/assign
Zähler einem Kunden zuordnen (Protected)

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439012",
  "startDate": "2024-12-18T00:00:00.000Z",
  "contractId": "507f1f77bcf86cd799439013"
}
```

---

## 📋 Verträge

### GET /contracts
Alle Verträge abrufen (Protected)

**Query Parameters:**
- `status` (string) - "active", "ended", "archived"
- `supplierId` (string) - Filter nach Anbieter
- `daysRemaining` (number) - Filter nach Restlaufzeit (z.B. 30, 60, 90)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "contractNumber": "CON000001",
      "customerId": {
        "firstName": "Anna",
        "lastName": "Schmidt",
        "customerNumber": "CUS000001"
      },
      "meterId": {
        "meterNumber": "Z123456789",
        "type": "electricity"
      },
      "supplierId": {
        "name": "E.ON",
        "shortName": "EON"
      },
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z",
      "durationMonths": 24,
      "status": "active"
    }
  ]
}
```

### POST /contracts
Neuen Vertrag anlegen (Protected)

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439012",
  "meterId": "507f1f77bcf86cd799439013",
  "supplierId": "507f1f77bcf86cd799439014",
  "startDate": "2024-01-01T00:00:00.000Z",
  "durationMonths": 24,
  "notes": "Sonderkonditionen"
}
```

### PATCH /contracts/:id/status
Vertragsstatus ändern (Protected)

**Request Body:**
```json
{
  "status": "ended"
}
```

---

## 🔔 Erinnerungen

### GET /reminders
Erinnerungen abrufen (Protected)

**Query Parameters:**
- `status` (string) - "open", "done", "ignored" (Standard: "open")

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "contractId": {
        "contractNumber": "CON000001",
        "customerId": {
          "firstName": "Anna",
          "lastName": "Schmidt"
        },
        "supplierId": {
          "name": "E.ON"
        }
      },
      "reminderType": "30days",
      "dueDate": "2025-12-01T00:00:00.000Z",
      "status": "open"
    }
  ]
}
```

### PATCH /reminders/:id/done
Erinnerung als erledigt markieren (Protected)

**Request Body:**
```json
{
  "note": "Kunde kontaktiert, Verlängerung vereinbart"
}
```

---

## 📊 Dashboard

### GET /dashboard/stats
Dashboard-Statistiken abrufen (Protected)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "expiringContracts": [
      {
        "contractNumber": "CON000001",
        "endDate": "2025-01-15T23:59:59.999Z",
        "customerId": { "firstName": "Anna", "lastName": "Schmidt" },
        "supplierId": { "name": "E.ON" }
      }
    ],
    "contractsBySupplier": [
      { "name": "E.ON", "count": 15 },
      { "name": "Vattenfall", "count": 12 }
    ],
    "customers": {
      "active": 45,
      "inactive": 5,
      "total": 50
    },
    "meters": {
      "free": 8,
      "occupied": 42,
      "total": 50
    },
    "reminders": {
      "high": 3,
      "medium": 7,
      "low": 12
    }
  }
}
```

---

## 🏢 Anbieter

### GET /suppliers
Alle Anbieter abrufen (Protected)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "E.ON Energie Deutschland GmbH",
      "shortName": "E.ON",
      "contactEmail": "kontakt@eon.de",
      "contactPhone": "+49 800 1234567",
      "isActive": true
    }
  ]
}
```

### POST /suppliers
Neuen Anbieter anlegen (Protected, Admin only)

**Request Body:**
```json
{
  "name": "E.ON Energie Deutschland GmbH",
  "shortName": "E.ON",
  "contactEmail": "kontakt@eon.de",
  "contactPhone": "+49 800 1234567"
}
```

---

## ❌ Fehlerbehandlung

### Standard-Fehlerformat

```json
{
  "success": false,
  "message": "Fehlermeldung",
  "errors": ["Detail 1", "Detail 2"]
}
```

### HTTP-Statuscodes

- `200` - OK
- `201` - Created
- `400` - Bad Request (Validierungsfehler)
- `401` - Unauthorized (Nicht authentifiziert)
- `403` - Forbidden (Keine Berechtigung)
- `404` - Not Found
- `409` - Conflict (z.B. E-Mail bereits vergeben)
- `500` - Internal Server Error

---

## 🔒 Sicherheit

### Rate Limiting
- API-Requests sind rate-limited
- Max. 100 Requests pro Minute pro IP

### Token-Gültigkeit
- Access Token: 30 Minuten
- Refresh Token: 7 Tage

### Passwort-Anforderungen
- Mindestens 12 Zeichen
- Mindestens 1 Großbuchstabe
- Mindestens 1 Zahl
- Mindestens 1 Sonderzeichen

---

**API Version:** 1.0.0  
**Letzte Aktualisierung:** Dezember 2025

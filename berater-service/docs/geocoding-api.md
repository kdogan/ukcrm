# Geocoding API - Adress-Autocomplete

## Übersicht

Die Geocoding API ermöglicht die automatische Adresssuche über OpenStreetMap/Nominatim. Da Browser-seitige Anfragen an Nominatim aufgrund von CORS blockiert werden, wird ein Backend-Proxy verwendet.

## Architektur

```
Frontend (Angular) --> Backend (Express) --> Nominatim API
     |                      |                    |
 geocoding.service.ts   geocodingController.js   nominatim.openstreetmap.org
```

## API Endpoint

### GET /api/geocoding/search

Sucht nach Adressen basierend auf einer Suchanfrage.

**Authentifizierung:** Erforderlich (JWT Token)

**Query Parameter:**
| Parameter | Typ    | Erforderlich | Beschreibung |
|-----------|--------|--------------|--------------|
| q         | string | Ja           | Suchbegriff (min. 3 Zeichen) |

**Beispiel Request:**
```
GET /api/geocoding/search?q=Musterstraße%201%20Berlin
Authorization: Bearer <token>
```

**Erfolgreiche Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "displayName": "Musterstraße 1, 10115 Berlin, Deutschland",
      "street": "Musterstraße 1",
      "houseNumber": "1",
      "zipCode": "10115",
      "city": "Berlin",
      "country": "Deutschland"
    }
  ]
}
```

**Fehler Response (500):**
```json
{
  "success": false,
  "message": "Fehler bei der Adresssuche"
}
```

## Dateien

### Backend

| Datei | Beschreibung |
|-------|--------------|
| `src/controllers/geocodingController.js` | Controller mit Nominatim-Proxy-Logik |
| `src/routes/geocodingRoutes.js` | Express Router für `/api/geocoding` |

### Frontend

| Datei | Beschreibung |
|-------|--------------|
| `src/app/services/geocoding.service.ts` | Angular Service für API-Aufrufe |
| `src/app/components/shared/address-autocomplete.component.ts` | Wiederverwendbare Autocomplete-Komponente |

## Server-Deployment

### Voraussetzungen

- Node.js (bereits vorhanden)
- Keine zusätzlichen npm-Pakete erforderlich (verwendet natives `https` Modul)

### Konfiguration

Die Route ist bereits in `server.js` registriert:

```javascript
const geocodingRoutes = require('./src/routes/geocodingRoutes');
// ...
app.use('/api/geocoding', apiLimiter, geocodingRoutes);
```

### Nach dem Deployment

1. **Server neu starten:**
   ```bash
   pm2 restart berater-service
   # oder
   systemctl restart berater-service
   ```

2. **Testen:**
   ```bash
   curl -X GET "http://localhost:3001/api/geocoding/search?q=Berlin" \
     -H "Authorization: Bearer <token>"
   ```

## Nominatim Usage Policy

Nominatim ist ein kostenloser Service von OpenStreetMap. Beachte die [Usage Policy](https://operations.osmfoundation.org/policies/nominatim/):

- Max. 1 Request pro Sekunde
- User-Agent Header ist gesetzt: `BeraterApp/1.0 (contact@eskapp.com)`
- Keine Bulk-Anfragen
- Caching wird empfohlen bei hohem Traffic

## Unterstützte Länder

Die Suche ist auf folgende Länder beschränkt:
- Deutschland (de)
- Österreich (at)
- Schweiz (ch)

Kann in `geocodingController.js` angepasst werden:
```javascript
countrycodes: 'de,at,ch'
```

## Fehlerbehebung

### "Fehler bei der Adresssuche"
- Prüfe ob der Server Internetzugang hat
- Prüfe ob Nominatim erreichbar ist: `curl https://nominatim.openstreetmap.org/search?q=Berlin&format=json`

### Keine Ergebnisse
- Suchbegriff muss mindestens 3 Zeichen haben
- Prüfe ob die Adresse in DE/AT/CH existiert

### CORS-Fehler im Frontend
- Stelle sicher, dass das Frontend den Backend-Proxy verwendet (`environment.apiUrl`)
- Nicht direkt `nominatim.openstreetmap.org` aufrufen

# PayPal Integration - Berater App

## Übersicht

Die PayPal-Integration ermöglicht es Benutzern, Pakete direkt über PayPal zu kaufen. Nach erfolgreicher Zahlung wird die Subscription automatisch aktiviert.

## Setup

### 1. PayPal Developer Account

1. Gehe zu [PayPal Developer](https://developer.paypal.com/)
2. Erstelle ein App-Konto (Sandbox für Tests, Live für Produktion)
3. Kopiere die **Client ID** und **Client Secret**

### 2. Backend-Konfiguration

In `.env` Datei:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_MODE=sandbox  # oder 'live' für Produktion
```

**Wichtig:** Für Produktion:
- `PAYPAL_MODE=live`
- Verwende Live Client ID und Secret
- Stelle sicher, dass die Return-URLs korrekt konfiguriert sind

### 3. PayPal SDK

Das Backend verwendet `@paypal/checkout-server-sdk`:

```bash
cd berater-service
npm install @paypal/checkout-server-sdk
```

## Architektur

### Backend

#### 1. PayPal Service (`src/services/paypalService.js`)
- `createOrder()` - Erstellt PayPal Order
- `captureOrder()` - Erfasst die Zahlung nach User-Genehmigung
- `getOrderDetails()` - Ruft Order-Details ab

#### 2. PayPal Controller (`src/controllers/paypalController.js`)
- `POST /api/paypal/create-order` - Erstellt Order für Paketkauf
- `POST /api/paypal/capture-order` - Erfasst Zahlung und aktiviert Subscription
- `GET /api/paypal/order/:orderId` - Ruft Order-Details ab

#### 3. PayPal Routes (`src/routes/paypalRoutes.js`)
Alle Routen erfordern Authentifizierung.

### Frontend

#### 1. PayPal Service (`src/app/services/paypal.service.ts`)
Angular Service für PayPal-API-Aufrufe

#### 2. Packages Component
- Erweitert um PayPal-Integration
- `purchaseWithPayPal()` - Leitet zur PayPal-Zahlung weiter
- Speichert Order-Informationen im `sessionStorage`

#### 3. Payment Pages
- **Success Page** (`payment-success.component.ts`)
  - Wird nach erfolgreicher Zahlung aufgerufen
  - Erfasst die Zahlung automatisch
  - Zeigt Subscription-Details an

- **Cancel Page** (`payment-cancel.component.ts`)
  - Wird aufgerufen, wenn User die Zahlung abbricht
  - Bereinigt `sessionStorage`

## Ablauf

### 1. Paketkauf initiieren

```typescript
// User klickt auf "Upgraden" oder "Kaufen"
changePackage(packageName: string, packageOrder: number) {
  // Für Upgrades und bezahlte Pakete
  this.purchaseWithPayPal(packageName, billingInterval);
}
```

### 2. PayPal Order erstellen

```typescript
purchaseWithPayPal(packageName, billingInterval) {
  this.paypalService.createOrder(packageName, billingInterval)
    .subscribe(response => {
      // Speichern der Order-ID
      sessionStorage.setItem('paypalOrderId', response.orderId);

      // Weiterleitung zu PayPal
      window.location.href = response.approvalUrl;
    });
}
```

### 3. User zahlt bei PayPal

- User wird zu PayPal weitergeleitet
- User meldet sich an und genehmigt Zahlung
- PayPal leitet zurück zu:
  - `http://localhost:4200/payment/success` (bei Erfolg)
  - `http://localhost:4200/payment/cancel` (bei Abbruch)

### 4. Zahlung erfassen (Success Page)

```typescript
ngOnInit() {
  const orderId = sessionStorage.getItem('paypalOrderId');
  this.paypalService.captureOrder(orderId)
    .subscribe(response => {
      // Subscription aktiviert
      // Details anzeigen
      this.subscriptionDetails = response.subscription;
    });
}
```

### 5. Backend verarbeitet Zahlung

```javascript
// capturePayPalOrder in paypalController.js
exports.capturePayPalOrder = async (req, res) => {
  // 1. PayPal Order erfassen
  const captureResult = await paypalService.captureOrder(orderId);

  // 2. User-Subscription aktualisieren
  await User.findByIdAndUpdate(userId, {
    package: targetPackage.name,
    subscription: {
      billingInterval,
      startDate,
      endDate,
      paymentMethod: 'paypal',
      paypalSubscriptionId: orderId,
      status: 'active'
    }
  });
};
```

## Datenfluss

```
User klickt "Upgraden"
  ↓
Frontend: createOrder()
  ↓
Backend: POST /api/paypal/create-order
  ↓
PayPal SDK: Erstellt Order
  ↓
Frontend: Redirect zu PayPal
  ↓
User zahlt bei PayPal
  ↓
PayPal: Redirect zu /payment/success
  ↓
Frontend: captureOrder()
  ↓
Backend: POST /api/paypal/capture-order
  ↓
Backend: Aktiviert Subscription
  ↓
Frontend: Zeigt Erfolg an
```

## SessionStorage Daten

Während des Zahlungsprozesses werden folgende Daten gespeichert:

```javascript
sessionStorage.setItem('paypalOrderId', orderId);
sessionStorage.setItem('paypalPackageName', packageName);
sessionStorage.setItem('paypalBillingInterval', billingInterval);
```

Diese werden nach erfolgreicher Zahlung oder Abbruch gelöscht.

## Subscription-Daten

Nach erfolgreicher Zahlung:

```javascript
user.subscription = {
  billingInterval: 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  autoRenew: true,
  status: 'active',
  paymentMethod: 'paypal',
  paypalSubscriptionId: orderId,
  lastTransactionId: transactionId
}
```

## Testing

### Sandbox-Testing

1. Verwende PayPal Sandbox-Accounts
2. Erstelle Test-Käufer in PayPal Developer Dashboard
3. Teste mit Sandbox-Credentials
4. Verwende `PAYPAL_MODE=sandbox`

### Test-Flow

1. Gehe zu `/packages`
2. Wähle ein Paket und Zahlungsintervall
3. Klicke "Upgraden"
4. Werde zu PayPal Sandbox weitergeleitet
5. Melde dich mit Test-Buyer-Account an
6. Genehmige Zahlung
7. Werde zu Success-Seite weitergeleitet
8. Überprüfe Dashboard - neues Paket sollte aktiv sein

## Fehlerbehandlung

### Frontend

- **Order-Erstellung fehlgeschlagen**: Alert-Nachricht
- **Capture fehlgeschlagen**: Error-Seite mit Nachricht
- **Keine Order-ID**: Error-Nachricht auf Success-Page

### Backend

- **PayPal API Error**: Logged und an Frontend zurückgegeben
- **Invalid Package**: 404 Response
- **User Update Error**: 500 Response

## Sicherheit

1. **Authentifizierung**: Alle PayPal-Routen erfordern Auth
2. **Order Verification**: OrderID wird im Backend validiert
3. **Custom Data**: Package- und User-Informationen in Order gespeichert
4. **Transaction Tracking**: Transaction-IDs werden gespeichert

## Production Checklist

- [ ] PayPal Live Credentials in `.env` konfiguriert
- [ ] `PAYPAL_MODE=live` gesetzt
- [ ] Return-URLs auf Production-Domain aktualisiert
- [ ] Webhook-URLs in PayPal konfiguriert (zukünftig)
- [ ] Error-Logging aktiviert
- [ ] Test-Käufe durchgeführt
- [ ] Subscription-Verlängerung getestet

## Zukünftige Erweiterungen

1. **PayPal Webhooks**: Automatische Benachrichtigungen für Subscription-Events
2. **Recurring Payments**: Automatische Subscription-Verlängerung
3. **Refund-Funktionalität**: Rückerstattungen über Backend
4. **Payment History**: Übersicht aller Zahlungen
5. **Invoice Generation**: Automatische Rechnungserstellung

## Support

Bei Problemen:
1. Prüfe PayPal Developer Dashboard für Order-Status
2. Prüfe Backend-Logs für API-Errors
3. Prüfe Browser Console für Frontend-Errors
4. Kontaktiere PayPal Support bei Payment-Issues

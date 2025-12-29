# Cache-Service Implementierung

## Überblick

Der `CacheService` wurde implementiert, um die Performance der Anwendung zu verbessern, indem häufig geladene Daten zwischengespeichert werden. Dies reduziert die Anzahl der API-Aufrufe und beschleunigt den Seitenwechsel erheblich.

## Funktionsweise

- **Cache-Dauer**: 5 Minuten (konfigurierbar)
- **Automatische Invalidierung**: Nach Ablauf der Cache-Dauer
- **CRUD-Integration**: Automatische Cache-Aktualisierung bei Create/Update/Delete
- **Verhindert Duplikate**: Mehrfache gleichzeitige Requests werden verhindert

## Unterstützte Entitäten

- `customers` - Kunden
- `contracts` - Verträge
- `meters` - Zähler
- `suppliers` - Anbieter
- `todos` - Aufgaben
- `supportTickets` - Support-Tickets

## Beispiel: Customer Service (bereits implementiert)

### Service-Integration

Der `CustomerService` wurde bereits mit Cache-Unterstützung ausgestattet:

```typescript
// Normale Nutzung (nutzt automatisch Cache)
this.customerService.getCustomers({ isActive: true }).subscribe(response => {
  this.customers = response.data;
});

// Force Refresh (ignoriert Cache)
this.customerService.getCustomers({ isActive: true, forceRefresh: true }).subscribe(response => {
  this.customers = response.data;
});

// Mit Suchfilter (nutzt keinen Cache, da dynamisch)
this.customerService.getCustomers({ search: 'Hans' }).subscribe(response => {
  this.filteredCustomers = response.data;
});
```

### CRUD-Operationen aktualisieren Cache automatisch

```typescript
// Create - fügt automatisch zum Cache hinzu
this.customerService.createCustomer(newCustomer).subscribe(response => {
  // Cache wurde automatisch aktualisiert
});

// Update - aktualisiert automatisch im Cache
this.customerService.updateCustomer(id, updatedCustomer).subscribe(response => {
  // Cache wurde automatisch aktualisiert
});

// Delete - entfernt automatisch aus Cache
this.customerService.deleteCustomer(id).subscribe(response => {
  // Cache wurde automatisch aktualisiert
});
```

## Weitere Services implementieren

### 1. Contract Service Beispiel

```typescript
import { CacheService } from './cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ContractService {
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  getContracts(filters: any = {}): Observable<ContractListResponse> {
    const useCache = !filters.search && !filters.status && !filters.forceRefresh;

    if (useCache) {
      const cachedData = this.cacheService.getCachedData<Contract>('contracts');
      if (cachedData) {
        return of({
          success: true,
          data: cachedData,
          pagination: { /* ... */ }
        });
      }

      if (this.cacheService.isLoading('contracts')) {
        // Warte auf laufenden Request
        return new Observable(observer => {
          const sub = this.cacheService.getCacheObservable$<Contract>('contracts')
            .subscribe(entry => {
              if (entry && !entry.isLoading) {
                observer.next({
                  success: true,
                  data: entry.data,
                  pagination: { /* ... */ }
                });
                observer.complete();
                sub.unsubscribe();
              }
            });
        });
      }

      this.cacheService.setLoading('contracts', true);
    }

    return this.http.get<ContractListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          if (useCache && response.success) {
            this.cacheService.setCachedData('contracts', response.data);
          }
        })
      );
  }

  createContract(contract: any): Observable<ContractResponse> {
    return this.http.post<ContractResponse>(this.apiUrl, contract).pipe(
      tap(response => {
        if (response.success) {
          this.cacheService.addCacheEntry('contracts', response.data);
        }
      })
    );
  }

  updateContract(id: string, contract: any): Observable<ContractResponse> {
    return this.http.put<ContractResponse>(`${this.apiUrl}/${id}`, contract).pipe(
      tap(response => {
        if (response.success) {
          this.cacheService.updateCacheEntry('contracts', response.data);
        }
      })
    );
  }

  deleteContract(id: string): Observable<ContractResponse> {
    return this.http.delete<ContractResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          this.cacheService.removeCacheEntry('contracts', id);
        }
      })
    );
  }
}
```

### 2. Meter Service Beispiel

```typescript
// Gleiche Struktur wie oben, nur mit 'meters' als Entity
getMeters(filters: any = {}): Observable<MeterListResponse> {
  const useCache = !filters.search && !filters.forceRefresh;

  if (useCache) {
    const cachedData = this.cacheService.getCachedData<Meter>('meters');
    if (cachedData) {
      // Filtere nach currentCustomerId wenn nötig
      const filtered = filters.isFree !== undefined
        ? cachedData.filter(m => !m.currentCustomerId)
        : cachedData;

      return of({ success: true, data: filtered, pagination: {...} });
    }
  }

  // ... REST wie oben
}
```

## Komponenten-Nutzung

### Komponente mit Cache

```typescript
@Component({...})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    // Lädt Daten - beim ersten Mal vom Server, danach aus Cache
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getCustomers({ isActive: true }).subscribe({
      next: (response) => {
        this.customers = response.data;
        // Blitzschnell beim zweiten Laden!
      }
    });
  }

  // Nach Create/Update/Delete ist Cache automatisch aktualisiert
  createCustomer(customer: any): void {
    this.customerService.createCustomer(customer).subscribe({
      next: () => {
        // Cache wurde automatisch aktualisiert
        // Beim nächsten loadCustomers() werden die Daten sofort aus Cache geladen
        this.loadCustomers(); // Sofort verfügbar!
      }
    });
  }

  // Manueller Refresh (z.B. Pull-to-Refresh)
  refresh(): void {
    this.customerService.getCustomers({
      isActive: true,
      forceRefresh: true
    }).subscribe({
      next: (response) => {
        this.customers = response.data;
      }
    });
  }
}
```

## Cache manuell invalidieren

```typescript
// In einer Komponente oder Service
constructor(private cacheService: CacheService) {}

// Einzelnen Cache invalidieren
invalidateCustomerCache(): void {
  this.cacheService.invalidateCache('customers');
}

// Alle Caches invalidieren (z.B. beim Logout)
logout(): void {
  this.cacheService.invalidateAllCaches();
  // ... weitere Logout-Logik
}
```

## Vorteile

### Performance-Verbesserungen

1. **Seitenwechsel**: Bis zu 90% schneller, da keine Server-Anfrage
2. **Netzwerk**: Reduzierte API-Calls sparen Bandbreite
3. **Server-Last**: Weniger Requests = geringere Backend-Last
4. **UX**: Sofortige Anzeige = bessere User Experience

### Typische Szenarien

**Vorher (ohne Cache):**
- User öffnet Kunden-Seite → 500ms Ladezeit
- User wechselt zu Verträgen → 600ms Ladezeit
- User zurück zu Kunden → 500ms Ladezeit ❌

**Nachher (mit Cache):**
- User öffnet Kunden-Seite → 500ms Ladezeit (erstes Mal)
- User wechselt zu Verträgen → 600ms Ladezeit (erstes Mal)
- User zurück zu Kunden → **<10ms Ladezeit** ✅

## Migration bestehender Services

### Schritt-für-Schritt Anleitung

1. **Service importieren**
   ```typescript
   import { CacheService } from './cache.service';
   ```

2. **Constructor erweitern**
   ```typescript
   constructor(
     private http: HttpClient,
     private cacheService: CacheService  // Hinzufügen
   ) {}
   ```

3. **GET-Methode erweitern**
   - Cache-Prüfung hinzufügen
   - Loading-Status setzen
   - Response im Cache speichern

4. **CREATE/UPDATE/DELETE erweitern**
   - `tap()` Operator hinzufügen
   - Cache aktualisieren

5. **Response-Typen definieren**
   ```typescript
   export interface EntityResponse {
     success: boolean;
     data: Entity;
   }
   ```

## Best Practices

### Wann Cache nutzen?

✅ **Cache nutzen bei:**
- Listen-Anfragen ohne spezielle Filter
- Häufig besuchten Seiten
- Master-Daten (Kunden, Verträge, etc.)

❌ **Kein Cache bei:**
- Such-Anfragen (`search` Parameter)
- Paginierten Anfragen (`page`, `limit`)
- Echtzeit-Daten (z.B. Dashboard-Statistiken)
- Selten besuchten Seiten

### Cache-Dauer anpassen

Standard: 5 Minuten

Für kürzere Dauer:
```typescript
// In cache.service.ts
private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 Minuten
```

Für längere Dauer:
```typescript
private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 Minuten
```

## Troubleshooting

### Problem: Daten werden nicht aktualisiert

**Lösung**: Force Refresh nutzen
```typescript
getCustomers({ forceRefresh: true })
```

### Problem: Cache zu groß

**Lösung 1**: Cache-Dauer reduzieren
**Lösung 2**: Nur wichtige Entitäten cachen

### Problem: Veraltete Daten nach Update von anderem Gerät

**Lösung**:
- Cache-Dauer reduzieren
- Oder WebSocket für Echtzeit-Updates nutzen
- Oder Polling mit `forceRefresh` implementieren

## Nächste Schritte

1. ✅ Customer Service - **Implementiert**
2. ⏳ Contract Service - Empfohlen
3. ⏳ Meter Service - Empfohlen
4. ⏳ Supplier Service - Optional
5. ⏳ Todo Service - Optional
6. ⏳ Support Ticket Service - Optional

## Monitoring

Um Cache-Performance zu überwachen:

```typescript
// Cache-Hit-Rate tracken
getCachedData<T>(entity: string): T[] | null {
  const data = this.cacheService.getCachedData<T>(entity);
  if (data) {
    console.log(`Cache HIT: ${entity}`);
  } else {
    console.log(`Cache MISS: ${entity}`);
  }
  return data;
}
```

---

**Entwickelt für**: Berater-ESKAPP
**Erstellt am**: 2025-12-29
**Version**: 1.0

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten Cache-Dauer

  // Separate Caches für verschiedene Entitäten
  private customersCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);
  private contractsCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);
  private metersCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);
  private suppliersCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);
  private todosCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);
  private supportTicketsCache$ = new BehaviorSubject<CacheEntry<any[]> | null>(null);

  constructor() {}

  /**
   * Prüft ob Cache noch gültig ist
   */
  private isCacheValid(entry: CacheEntry<any> | null): boolean {
    if (!entry) return false;
    const age = Date.now() - entry.timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Gibt einen Observable für eine bestimmte Entity zurück
   */
  private getCacheObservable(entity: string): BehaviorSubject<CacheEntry<any[]> | null> {
    switch (entity) {
      case 'customers': return this.customersCache$;
      case 'contracts': return this.contractsCache$;
      case 'meters': return this.metersCache$;
      case 'suppliers': return this.suppliersCache$;
      case 'todos': return this.todosCache$;
      case 'supportTickets': return this.supportTicketsCache$;
      default: throw new Error(`Unknown entity: ${entity}`);
    }
  }

  /**
   * Gibt gecachte Daten zurück, falls vorhanden und gültig
   */
  getCachedData<T>(entity: string): T[] | null {
    const cache$ = this.getCacheObservable(entity);
    const entry = cache$.value;

    if (this.isCacheValid(entry)) {
      return entry!.data as T[];
    }

    return null;
  }

  /**
   * Gibt ein Observable zurück, das auf Cache-Änderungen reagiert
   */
  getCacheObservable$<T>(entity: string): Observable<CacheEntry<T[]> | null> {
    return this.getCacheObservable(entity).asObservable() as Observable<CacheEntry<T[]> | null>;
  }

  /**
   * Speichert Daten im Cache
   */
  setCachedData<T>(entity: string, data: T[]): void {
    const cache$ = this.getCacheObservable(entity);
    cache$.next({
      data,
      timestamp: Date.now(),
      isLoading: false
    });
  }

  /**
   * Setzt Loading-Status
   */
  setLoading(entity: string, isLoading: boolean): void {
    const cache$ = this.getCacheObservable(entity);
    const current = cache$.value;

    cache$.next({
      data: current?.data || [],
      timestamp: current?.timestamp || Date.now(),
      isLoading
    });
  }

  /**
   * Prüft ob Daten gerade geladen werden
   */
  isLoading(entity: string): boolean {
    const cache$ = this.getCacheObservable(entity);
    return cache$.value?.isLoading || false;
  }

  /**
   * Invaliert den Cache für eine bestimmte Entity
   */
  invalidateCache(entity: string): void {
    const cache$ = this.getCacheObservable(entity);
    cache$.next(null);
  }

  /**
   * Invaliert alle Caches
   */
  invalidateAllCaches(): void {
    this.customersCache$.next(null);
    this.contractsCache$.next(null);
    this.metersCache$.next(null);
    this.suppliersCache$.next(null);
    this.todosCache$.next(null);
    this.supportTicketsCache$.next(null);
  }

  /**
   * Aktualisiert einen einzelnen Eintrag im Cache
   */
  updateCacheEntry<T extends { _id: string }>(entity: string, updatedItem: T): void {
    const cache$ = this.getCacheObservable(entity);
    const entry = cache$.value;

    if (entry && entry.data) {
      const index = entry.data.findIndex((item: any) => item._id === updatedItem._id);
      if (index !== -1) {
        const newData = [...entry.data];
        newData[index] = updatedItem;
        cache$.next({
          ...entry,
          data: newData,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Fügt einen neuen Eintrag zum Cache hinzu
   */
  addCacheEntry<T>(entity: string, newItem: T): void {
    const cache$ = this.getCacheObservable(entity);
    const entry = cache$.value;

    if (entry && entry.data) {
      cache$.next({
        ...entry,
        data: [...entry.data, newItem],
        timestamp: Date.now()
      });
    }
  }

  /**
   * Entfernt einen Eintrag aus dem Cache
   */
  removeCacheEntry(entity: string, itemId: string): void {
    const cache$ = this.getCacheObservable(entity);
    const entry = cache$.value;

    if (entry && entry.data) {
      cache$.next({
        ...entry,
        data: entry.data.filter((item: any) => item._id !== itemId),
        timestamp: Date.now()
      });
    }
  }
}

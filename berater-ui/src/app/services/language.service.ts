import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type Language = 'de' | 'tr';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app_language';
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private currentLanguageSubject = new BehaviorSubject<Language>('de');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  readonly availableLanguages: LanguageOption[] = [
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
  ];

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {
    // Verfügbare Sprachen setzen
    this.translate.addLangs(['de', 'tr']);
    this.translate.setDefaultLang('de');
  }

  /**
   * Initialisiert die Sprache beim App-Start
   * Priorität: localStorage > Backend > Default (de)
   */
  initializeLanguage(): void {
    const storedLang = this.getStoredLanguage();
    if (storedLang) {
      this.setLanguage(storedLang, false);
    } else {
      // Fallback: Deutsch
      this.setLanguage('de', false);
    }
  }

  /**
   * Lädt die Sprache vom Backend (nach Login)
   */
  loadUserLanguage(): Observable<{ language: Language }> {
    return this.http.get<{ success: boolean; data: { language: Language } }>(`${this.apiUrl}/language`)
      .pipe(
        tap(response => {
          if (response.success && response.data?.language) {
            this.setLanguage(response.data.language, false);
          }
        }),
        catchError(() => {
          // Bei Fehler, behalte aktuelle Sprache
          return of({ language: this.getCurrentLanguage() });
        })
      ) as Observable<{ language: Language }>;
  }

  /**
   * Setzt die aktuelle Sprache
   */
  setLanguage(lang: Language, saveToBackend: boolean = true): void {
    // Validierung
    if (!this.availableLanguages.some(l => l.code === lang)) {
      console.warn(`Language ${lang} not supported, falling back to 'de'`);
      lang = 'de';
    }

    // TranslateService aktualisieren
    this.translate.use(lang);

    // Im localStorage speichern
    localStorage.setItem(this.STORAGE_KEY, lang);

    // Subject aktualisieren
    this.currentLanguageSubject.next(lang);

    // Optional: Im Backend speichern
    if (saveToBackend) {
      this.saveLanguageToBackend(lang).subscribe();
    }
  }

  /**
   * Gibt die aktuelle Sprache zurück
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Holt die Sprache aus dem localStorage
   */
  private getStoredLanguage(): Language | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && (stored === 'de' || stored === 'tr')) {
      return stored as Language;
    }
    return null;
  }

  /**
   * Speichert die Sprache im Backend
   */
  saveLanguageToBackend(lang: Language): Observable<any> {
    return this.http.put(`${this.apiUrl}/language`, { language: lang })
      .pipe(
        catchError(error => {
          console.error('Error saving language to backend:', error);
          return of(null);
        })
      );
  }

  /**
   * Wechselt zwischen den verfügbaren Sprachen
   */
  toggleLanguage(): void {
    const current = this.getCurrentLanguage();
    const newLang: Language = current === 'de' ? 'tr' : 'de';
    this.setLanguage(newLang);
  }

  /**
   * Gibt die Sprachoptionen für ein Dropdown zurück
   */
  getLanguageOptions(): LanguageOption[] {
    return this.availableLanguages;
  }
}

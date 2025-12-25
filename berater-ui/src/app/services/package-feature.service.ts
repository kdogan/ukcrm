import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackageFeatureService {

  constructor(private authService: AuthService) {}

  /**
   * Prüft ob ein bestimmtes Feature für den aktuellen User verfügbar ist
   * @param featureName Name des Features (z.B. 'file_upload')
   * @returns true wenn Feature verfügbar, sonst false
   */
  hasFeature(featureName: string): boolean {
    const user = this.authService.currentUser;

    if (!user) {
      return false;
    }

    // Superadmin und Admin haben immer Zugriff auf alle Features
    if (user.role === 'superadmin' || user.role === 'admin') {
      return true;
    }

    // Prüfe ob Feature in packageFeatures vorhanden und aktiviert ist
    if (!user.packageFeatures || user.packageFeatures.length === 0) {
      return false;
    }

    const feature = user.packageFeatures.find(f => f.name === featureName);
    return feature ? feature.enabled : false;
  }

  /**
   * Prüft ob File-Upload für den aktuellen User verfügbar ist
   */
  hasFileUpload(): boolean {
    return this.hasFeature('file_upload');
  }

  /**
   * Observable das true/false zurückgibt wenn File-Upload verfügbar ist
   */
  hasFileUpload$(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        if (user.role === 'superadmin' || user.role === 'admin') return true;

        const feature = user.packageFeatures?.find(f => f.name === 'file_upload');
        return feature ? feature.enabled : false;
      })
    );
  }

  /**
   * Gibt den Package-Namen des aktuellen Users zurück
   */
  getCurrentPackage(): string | undefined {
    return this.authService.currentUser?.package;
  }

  /**
   * Gibt alle Features des aktuellen Users zurück
   */
  getAllFeatures(): { name: string; enabled: boolean }[] {
    return this.authService.currentUser?.packageFeatures || [];
  }
}

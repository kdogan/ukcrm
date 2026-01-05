import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EducationMaterial {
  _id?: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'document' | 'link' | 'image';
  url: string;
  videoId?: string|null;
  thumbnail?: string;
  category: 'onboarding' | 'training' | 'product-info' | 'sales' | 'support' | 'other';
  language: 'de' | 'tr';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sharedWith: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  views: number;
  viewedBy?: Array<{
    userId: string;
    viewedAt: Date;
  }>;
  order?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  pdfFile?:File;
  pdfName?:string;
  pdfBase64?:string
}

export interface EducationStats {
  totalMaterials: number;
  materialsByType: Array<{ _id: string; count: number }>;
  totalViews: number;
  sharedBeraterCount: number;
}

export interface Berater {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isMasterBerater: boolean;
}

export interface ShareStatus {
  isMasterBerater: boolean;
  shareToken: string | null;
  masterBerater: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private apiUrl = `${environment.apiUrl}/education`;
  private usersApiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<{ success: boolean; data: EducationMaterial[] }> {
    return this.http.get<{ success: boolean; data: EducationMaterial[] }>(this.apiUrl);
  }

  getMaterial(id: string): Observable<{ success: boolean; data: EducationMaterial }> {
    return this.http.get<{ success: boolean; data: EducationMaterial }>(`${this.apiUrl}/${id}`);
  }

  createMaterial(material: Partial<EducationMaterial>): Observable<{ success: boolean; message: string; data: EducationMaterial }> {
    return this.http.post<{ success: boolean; message: string; data: EducationMaterial }>(this.apiUrl, material);
  }

  updateMaterial(id: string, material: Partial<EducationMaterial>): Observable<{ success: boolean; message: string; data: EducationMaterial }> {
    return this.http.put<{ success: boolean; message: string; data: EducationMaterial }>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<{ success: boolean; data: EducationStats }> {
    return this.http.get<{ success: boolean; data: EducationStats }>(`${this.apiUrl}/stats`);
  }

  getBeraterList(): Observable<{ success: boolean; data: Berater[] }> {
    return this.http.get<{ success: boolean; data: Berater[] }>(`${this.apiUrl}/berater/list`);
  }

  // Helper methods
  extractYouTubeId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      video: 'fas fa-video',
      pdf: 'fas fa-file-pdf',
      document: 'fas fa-file-alt',
      link: 'fas fa-link',
      image: 'fas fa-image'
    };
    return icons[type] || 'fas fa-file';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      onboarding: 'Onboarding',
      training: 'Training',
      'product-info': 'Produktinformationen',
      sales: 'Vertrieb',
      support: 'Support',
      other: 'Sonstiges'
    };
    return labels[category] || category;
  }

    // -------------------------------
  // PDF / FormData Erstellung
  // -------------------------------
  createMaterialFormData(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateMaterialFormData(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

    /**
   * Holt das PDF eines Materials als Blob
   */
  getPdf(materialId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/${materialId}`, { responseType: 'blob' });
  }

  /**
   * Registriert einen View für ein Material
   */
  registerView(materialId: string): Observable<{ success: boolean; message: string; data: { views: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { views: number } }>(`${this.apiUrl}/${materialId}/view`, {});
  }

  // -------------------------------
  // Master Berater Token API
  // -------------------------------

  /**
   * Share-Status und Token abrufen
   */
  getShareStatus(): Observable<{ success: boolean; data: ShareStatus }> {
    return this.http.get<{ success: boolean; data: ShareStatus }>(`${this.usersApiUrl}/share-status`);
  }

  /**
   * Share-Token generieren (nur Master Berater)
   */
  generateShareToken(): Observable<{ success: boolean; message: string; data: { shareToken: string } }> {
    return this.http.post<{ success: boolean; message: string; data: { shareToken: string } }>(`${this.usersApiUrl}/generate-token`, {});
  }

  /**
   * Mit Master Berater per Token verbinden
   */
  connectByToken(token: string): Observable<{ success: boolean; message: string; data: { masterBerater: { _id: string; firstName: string; lastName: string } } }> {
    return this.http.post<{ success: boolean; message: string; data: { masterBerater: { _id: string; firstName: string; lastName: string } } }>(`${this.usersApiUrl}/connect-by-token`, { token });
  }

  /**
   * Verbindung zum Master Berater trennen
   */
  disconnectMasterBerater(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.usersApiUrl}/disconnect-master`, {});
  }
}

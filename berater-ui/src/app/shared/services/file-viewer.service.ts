import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FileData {
  url: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileViewerService {
  private fileDataSubject = new BehaviorSubject<FileData | null>(null);
  fileData$ = this.fileDataSubject.asObservable();

  open(url: string, name: string): void {
    this.fileDataSubject.next({ url, name });
  }

  close(): void {
    this.fileDataSubject.next(null);
  }
}

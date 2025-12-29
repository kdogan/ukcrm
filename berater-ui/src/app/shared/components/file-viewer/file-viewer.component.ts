import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileViewerService } from '../../services/file-viewer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss'
})
export class FileViewerComponent implements OnInit, OnDestroy {
  isOpen = false;
  fileUrl = '';
  fileName = '';
  fileType = '';

  private subscription?: Subscription;

  constructor(private fileViewerService: FileViewerService) {}

  ngOnInit(): void {
    this.subscription = this.fileViewerService.fileData$.subscribe(data => {
      if (data) {
        this.fileUrl = data.url;
        this.fileName = data.name;
        this.fileType = this.getFileType(data.name);
        this.isOpen = true;
      } else {
        this.isOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.fileViewerService.close();
  }

  download(): void {
    const link = document.createElement('a');
    link.href = this.fileUrl;
    link.download = this.fileName;
    link.click();
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
      return 'image';
    }

    // PDF
    if (ext === 'pdf') {
      return 'pdf';
    }

    // Text files
    if (['txt', 'log', 'md'].includes(ext)) {
      return 'text';
    }

    // Office documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return 'office';
    }

    // Video
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
      return 'video';
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return 'audio';
    }

    return 'unknown';
  }

  isImage(): boolean {
    return this.fileType === 'image';
  }

  isPdf(): boolean {
    return this.fileType === 'pdf';
  }

  isVideo(): boolean {
    return this.fileType === 'video';
  }

  isAudio(): boolean {
    return this.fileType === 'audio';
  }

  isUnknown(): boolean {
    return this.fileType === 'unknown' || this.fileType === 'office' || this.fileType === 'text';
  }
}

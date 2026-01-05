import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EducationMaterial, EducationStats } from '../../../services/education.service';

@Component({
  selector: 'app-education-desktop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-desktop.component.html',
  styleUrls: ['./education-desktop.component.scss']
})
export class EducationDesktopComponent {
  @Input({ required: true }) materials!: EducationMaterial[];
  @Input() stats!: EducationStats | null;
  @Input({ required: true }) isMasterBerater!: boolean;
  @Input({ required: true }) loading!: boolean;
  @Input({ required: true }) searchTerm!: string;
  @Input({ required: true }) selectedCategory!: string;
  @Input({ required: true }) selectedType!: string;
  @Input({ required: true }) selectedLanguage!: string;
  @Input({ required: true }) categoryOptions!: any[];
  @Input({ required: true }) typeOptions!: any[];
  @Input({ required: true }) languageOptions!: any[];

  // Token-related inputs
  @Input() shareToken: string | null = null;
  @Input() connectedMasterBerater: { _id: string; firstName: string; lastName: string } | null = null;
  @Input() tokenInput: string = '';
  @Input() tokenError: string = '';
  @Input() tokenSuccess: string = '';

  @Output() createMaterial = new EventEmitter<void>();
  @Output() editMaterial = new EventEmitter<EducationMaterial>();
  @Output() deleteMaterial = new EventEmitter<EducationMaterial>();
  @Output() viewMaterial = new EventEmitter<EducationMaterial>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() typeChange = new EventEmitter<string>();
  @Output() languageChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();

  // Token-related outputs
  @Output() generateToken = new EventEmitter<void>();
  @Output() connectWithToken = new EventEmitter<void>();
  @Output() disconnectFromMaster = new EventEmitter<void>();
  @Output() copyToken = new EventEmitter<void>();
  @Output() tokenInputChange = new EventEmitter<string>();

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

  getYouTubeThumbnail(videoId: string | undefined): string {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}

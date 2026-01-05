import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EducationService, EducationMaterial, EducationStats, Berater } from '../../services/education.service';
import { AuthService } from '../../services/auth.service';
import { ViewportService } from '../../services/viewport.service';
import { EducationDesktopComponent } from './desktop/education-desktop.component';
import { EducationMobileComponent } from './mobile/education-mobile.component';
import { OverlayModalComponent } from '../shared/overlay-modal.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EducationDesktopComponent,
    EducationMobileComponent,
    OverlayModalComponent
  ],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss']
})
export class EducationComponent implements OnInit, OnDestroy {
  materials: EducationMaterial[] = [];
  filteredMaterials: EducationMaterial[] = [];
  stats: EducationStats | null = null;
  beraterList: Berater[] = [];

  isMasterBerater = false;
  loading = true;

  // Filter & Search
  searchTerm = '';
  selectedCategory = '';
  selectedType = '';
  selectedLanguage = '';

  // Modal
  showModal = false;
  showDeleteConfirm = false;
  showVideoPlayer = false;
  isEditMode = false;
  currentMaterial: Partial<EducationMaterial> = this.getEmptyMaterial();
  materialToDelete: EducationMaterial | null = null;
  currentVideoId: string | null = null;

  showPdfViewer = false;
  currentPdfDataUrl: SafeResourceUrl | null = null;
  currentPdfName: string | null = null;
  


  // Berater Selection
  selectedBeraterIds: string[] = [];

  // Options
  categoryOptions = [
    { value: '', label: 'Alle Kategorien' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'training', label: 'Training' },
    { value: 'product-info', label: 'Produktinformationen' },
    { value: 'sales', label: 'Vertrieb' },
    { value: 'support', label: 'Support' },
    { value: 'other', label: 'Sonstiges' }
  ];

  typeOptions = [
    { value: '', label: 'Alle Typen' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'document', label: 'Dokument' },
    { value: 'link', label: 'Link' },
    { value: 'image', label: 'Bild' }
  ];

  languageOptions = [
    { value: '', label: 'Alle Sprachen' },
    { value: 'de', label: 'Deutsch' },
    { value: 'tr', label: 'Türkisch' }
  ];

  constructor(
    private educationService: EducationService,
    private authService: AuthService,
    public viewportService: ViewportService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadMaterials();
    if (this.isMasterBerater) {
      this.loadStats();
      this.loadBeraterList();
    }
    this.setupFullscreenListener();
  }

  ngOnDestroy(): void {
    this.removeFullscreenListener();
  }

  private setupFullscreenListener(): void {
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
  }

  private removeFullscreenListener(): void {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
  }

  private handleFullscreenChange(): void {
    const isFullscreen = !!(document.fullscreenElement ||
                           (document as any).webkitFullscreenElement ||
                           (document as any).mozFullScreenElement);

    // Hide/show modal overlay
    const modalOverlay = document.querySelector('app-overlay-modal .modal-overlay') as HTMLElement;
    if (modalOverlay) {
      if (isFullscreen) {
        modalOverlay.style.display = 'none';
      } else {
        modalOverlay.style.display = 'flex';
      }
    }
  }

  checkUserRole(): void {
    const user = this.authService.currentUser;
    this.isMasterBerater = user?.isMasterBerater || false;
  }

  loadMaterials(): void {
    this.loading = true;
    this.educationService.getMaterials().subscribe({
      next: (response) => {
        if (response.success) {
          this.materials = response.data;
          this.filterMaterials();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Materialien:', error);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.educationService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Statistiken:', error);
      }
    });
  }

  loadBeraterList(): void {
    this.educationService.getBeraterList().subscribe({
      next: (response) => {
        if (response.success) {
          this.beraterList = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Berater-Liste:', error);
      }
    });
  }

  filterMaterials(): void {
    this.filteredMaterials = this.materials.filter(material => {
      const matchesSearch = !this.searchTerm ||
        material.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (material.description?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesCategory = !this.selectedCategory || material.category === this.selectedCategory;
      const matchesType = !this.selectedType || material.type === this.selectedType;
      const matchesLanguage = !this.selectedLanguage || material.language === this.selectedLanguage;

      return matchesSearch && matchesCategory && matchesType && matchesLanguage;
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.filterMaterials();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterMaterials();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.filterMaterials();
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage = language;
    this.filterMaterials();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.selectedLanguage = '';
    this.filterMaterials();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentMaterial = this.getEmptyMaterial();
    this.selectedBeraterIds = [];
    this.showModal = true;
  }

  openEditModal(material: EducationMaterial): void {
    this.isEditMode = true;
    this.currentMaterial = { ...material };
    this.selectedBeraterIds = material.sharedWith.map(b => b._id);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentMaterial = this.getEmptyMaterial();
    this.selectedBeraterIds = [];
  }

  saveMaterial(): void {
    // Extract YouTube ID if video type
    if (this.currentMaterial.type === 'video' && this.currentMaterial.url) {
      const videoId = this.educationService.extractYouTubeId(this.currentMaterial.url);
      if (videoId) {
        this.currentMaterial.videoId = videoId;
      }
    }

    // Add sharedWith IDs - cast to any to avoid type conflict with API
    const materialData: any = {
      ...this.currentMaterial,
      sharedWith: this.selectedBeraterIds
    };

    if (this.isEditMode && this.currentMaterial._id) {
      this.educationService.updateMaterial(this.currentMaterial._id, materialData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMaterials();
            if (this.isMasterBerater) {
              this.loadStats();
            }
            this.closeModal();
          }
        },
        error: (error) => {
          console.error('Fehler beim Aktualisieren:', error);
          alert('Fehler beim Aktualisieren des Materials');
        }
      });
    } else {
      this.educationService.createMaterial(materialData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMaterials();
            if (this.isMasterBerater) {
              this.loadStats();
            }
            this.closeModal();
          }
        },
        error: (error) => {
          console.error('Fehler beim Erstellen:', error);
          alert('Fehler beim Erstellen des Materials');
        }
      });
    }
  }

  confirmDelete(material: EducationMaterial): void {
    this.materialToDelete = material;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.materialToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteMaterial(): void {
    if (this.materialToDelete && this.materialToDelete._id) {
      this.educationService.deleteMaterial(this.materialToDelete._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMaterials();
            if (this.isMasterBerater) {
              this.loadStats();
            }
            this.cancelDelete();
          }
        },
        error: (error) => {
          console.error('Fehler beim Löschen:', error);
          alert('Fehler beim Löschen des Materials');
        }
      });
    }
  }

  viewMaterial(material: EducationMaterial): void {
    // View registrieren (nur für Nicht-Master-Berater)
    if (material._id && !this.isMasterBerater) {
      this.educationService.registerView(material._id).subscribe({
        next: () => {
          // View-Zähler im lokalen Material aktualisieren
          const index = this.materials.findIndex(m => m._id === material._id);
          if (index !== -1) {
            this.materials[index].views = (this.materials[index].views || 0) + 1;
            this.filterMaterials();
          }
        },
        error: (err) => console.error('View konnte nicht registriert werden', err)
      });
    }

    if (material.type === 'video' && material.videoId) {
      // Zeige YouTube-Video im eingebetteten Player
      this.currentVideoId = material.videoId;
      this.showVideoPlayer = true;
    } else if (material.type === 'pdf' && material._id) {
      // PDF im Fullscreen-Overlay anzeigen
      this.educationService.getPdf(material._id).subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.currentPdfDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
          this.currentPdfName = material.title || 'document.pdf';
          this.showPdfViewer = true;
        },
        error: (err) => {
          console.error('PDF konnte nicht geladen werden', err);
          alert('PDF konnte nicht geladen werden');
        }
      });
    } else if (material.type === 'link') {
      window.open(material.url, '_blank');
    } else if (material.url) {
      window.open(material.url, '_blank');
    }
  }

  closeVideoPlayer(): void {
    this.showVideoPlayer = false;
    this.currentVideoId = null;
  }


  getYouTubeEmbedUrl(): SafeResourceUrl | null {
    if (!this.currentVideoId) return null;
    const url = `https://www.youtube.com/embed/${this.currentVideoId}?autoplay=1&rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleBeraterSelection(berater: Berater, event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.selectedBeraterIds.includes(berater._id)) {
        this.selectedBeraterIds.push(berater._id);
      }
    } else {
      const index = this.selectedBeraterIds.indexOf(berater._id);
      if (index > -1) {
        this.selectedBeraterIds.splice(index, 1);
      }
    }
  }

  isBeraterSelected(beraterId: string): boolean {
    return this.selectedBeraterIds.includes(beraterId);
  }

  getEmptyMaterial(): Partial<EducationMaterial> {
    return {
      title: '',
      description: '',
      type: 'video',
      url: '',
      category: 'other',
      language: 'de',
      sharedWith: []
    };
  }

  getTypeIcon(type: string): string {
    return this.educationService.getTypeIcon(type);
  }

  getYouTubeThumbnail(videoId: string | undefined): string {
    if (!videoId) return '';
    return this.educationService.getYouTubeThumbnail(videoId);
  }

onPdfSelected(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 12 * 1024 * 1024) { // 12 MB Limit
    alert('Die PDF-Datei darf maximal 12 MB groß sein.');
    event.target.value = ''; // Input zurücksetzen
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    this.currentMaterial.pdfBase64 = reader.result?.toString() || '';
    this.currentMaterial.pdfName = file.name;
  };
  reader.readAsDataURL(file);
}

closePdfViewer(): void {
  this.showPdfViewer = false;
  this.currentPdfDataUrl = null;
  this.currentPdfName = null;
}
}

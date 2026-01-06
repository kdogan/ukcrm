import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TodoService, Todo } from '../../services/todo.service';
import { AuthService } from '../../services/auth.service';
import { FileViewerService } from '../../shared/services/file-viewer.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  tickets: Todo[] = [];
  filteredTickets: Todo[] = [];
  showCreateModal = false;
  showViewModal = false;
  selectedTicket: Todo | null = null;
  currentUser: any = null;
  isSuperAdmin = false;

  // Search and Filter
  searchQuery = '';
  filterStatus: 'all' | 'open' | 'in_progress' = 'all'; // Default: show all open tickets
  filterPriority: 'all' | 'low' | 'medium' | 'high' = 'all';
  filterAnswered: 'all' | 'answered' | 'unanswered' = 'all';
  showCompleted = false; // Hide completed tickets by default

  // Create Ticket Form
  newTicket = {
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  };
  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  // Response Form (used by both Berater and Admin)
  beraterResponse = '';
  adminResponse = '';
  responseStatus: 'open' | 'in_progress' | 'completed' = 'in_progress';

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private fileViewerService: FileViewerService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isSuperAdmin = user?.role === 'superadmin';
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    if (this.isSuperAdmin) {
      this.todoService.getSupportTickets().subscribe({
        next: (response) => {
          if (response.success) {
            this.tickets = response.data;
            this.applyFilters();
          }
        },
        error: (error) => console.error('Fehler beim Laden der Tickets:', error)
      });
    } else {
      // Berater sees only their own support tickets
      this.todoService.getMySupportTickets().subscribe({
        next: (response) => {
          if (response.success) {
            this.tickets = response.data;
            this.applyFilters();
          }
        },
        error: (error) => console.error('Fehler beim Laden der Tickets:', error)
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.tickets];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => {
        const titleMatch = ticket.title.toLowerCase().includes(query);
        const descMatch = ticket.description?.toLowerCase().includes(query);
        const beraterMatch = this.isSuperAdmin && typeof ticket.beraterId === 'object' ?
          `${ticket.beraterId.firstName} ${ticket.beraterId.lastName}`.toLowerCase().includes(query) :
          false;
        return titleMatch || descMatch || beraterMatch;
      });
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === this.filterStatus);
    }

    // Hide completed tickets unless showCompleted is checked
    if (!this.showCompleted) {
      filtered = filtered.filter(ticket => ticket.status !== 'completed');
    }

    // Priority filter
    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === this.filterPriority);
    }

    // Answered filter
    if (this.filterAnswered !== 'all') {
      if (this.filterAnswered === 'answered') {
        filtered = filtered.filter(ticket => ticket.adminResponse || ticket.beraterResponse);
      } else {
        filtered = filtered.filter(ticket => !ticket.adminResponse && !ticket.beraterResponse);
      }
    }

    this.filteredTickets = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterAnswered = 'all';
    this.showCompleted = false;
    this.applyFilters();
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files).slice(0, 5); // Max 5 images
      this.selectedImages = files;

      // Generate previews
      this.imagePreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  createTicket(): void {
    if (!this.newTicket.title || !this.newTicket.description) {
      alert('Bitte Titel und Beschreibung eingeben');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newTicket.title);
    formData.append('description', this.newTicket.description);
    formData.append('priority', this.newTicket.priority);

    this.selectedImages.forEach(image => {
      formData.append('images', image);
    });

    this.todoService.createSupportTicket(formData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Support-Ticket erfolgreich erstellt');
          this.closeCreateModal();
          this.loadTickets();
        }
      },
      error: (error) => {
        console.error('Fehler beim Erstellen des Tickets:', error);
        alert('Fehler beim Erstellen des Tickets');
      }
    });
  }

  viewTicket(ticket: Todo): void {
    this.selectedTicket = ticket;
    this.showViewModal = true;
    this.beraterResponse = '';
    this.adminResponse = '';
    // Set current ticket status
    this.responseStatus = ticket.status;

    // Mark as read if Berater opens a ticket with admin response
    if (!this.isSuperAdmin && ticket.adminResponse) {
      this.todoService.markSupportTicketAsRead(ticket._id).subscribe({
        error: (error) => console.error('Fehler beim Markieren als gelesen:', error)
      });
    }
  }

  submitResponse(): void {
    if (!this.selectedTicket) {
      return;
    }

    // Check if status changed or response provided
    const statusChanged = this.selectedTicket.status !== this.responseStatus;
    const beraterHasResponse = this.beraterResponse && this.beraterResponse.trim().length > 0;
    const adminHasResponse = this.adminResponse && this.adminResponse.trim().length > 0;
    const hasResponse = beraterHasResponse || adminHasResponse;

    if (!statusChanged && !hasResponse) {
      alert('Bitte eine Antwort eingeben oder den Status ändern');
      return;
    }

    // Use the appropriate response based on user role
    const responseText = this.isSuperAdmin ? this.adminResponse : this.beraterResponse;

    this.todoService.respondToSupportTicket(
      this.selectedTicket._id,
      responseText,
      this.responseStatus
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (hasResponse && statusChanged) {
            alert('Antwort und Status erfolgreich aktualisiert');
          } else if (hasResponse) {
            alert('Antwort erfolgreich gespeichert');
          } else if (statusChanged) {
            alert('Status erfolgreich geändert');
          }
          this.closeViewModal();
          this.loadTickets();
        }
      },
      error: (error) => {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern');
      }
    });
  }

  closeTicket(): void {
    if (!this.selectedTicket) {
      return;
    }

    if (!confirm('Möchten Sie dieses Ticket wirklich als abgeschlossen markieren?')) {
      return;
    }

    this.todoService.respondToSupportTicket(
      this.selectedTicket._id,
      '', // No response text needed
      'completed'
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Ticket erfolgreich abgeschlossen');
          this.closeViewModal();
          this.loadTickets();
        }
      },
      error: (error) => {
        console.error('Fehler beim Abschließen des Tickets:', error);
        alert('Fehler beim Abschließen des Tickets');
      }
    });
  }

  getImageUrl(ticketId: string, filename: string): string {
    return this.todoService.getSupportTicketImageUrl(ticketId, filename);
  }

  showCreateTicketModal(): void {
    this.newTicket = {
      title: '',
      description: '',
      priority: 'medium'
    };
    this.selectedImages = [];
    this.imagePreviews = [];
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTicket = null;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch'
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'open': 'Offen',
      'in_progress': 'In Bearbeitung',
      'completed': 'Abgeschlossen'
    };
    return labels[status] || status;
  }

  getBeraterName(ticket: Todo): string {
    if (typeof ticket.beraterId === 'object') {
      return `${ticket.beraterId.firstName} ${ticket.beraterId.lastName}`;
    }
    return 'Unbekannt';
  }

  openImageViewer(imageUrl: string): void {
    // Extract filename from URL (remove query parameters)
    const urlWithoutQuery = imageUrl.split('?')[0];
    const filename = urlWithoutQuery.split('/').pop() || 'ticket-image.png';
    this.fileViewerService.open(imageUrl, filename);
  }
}

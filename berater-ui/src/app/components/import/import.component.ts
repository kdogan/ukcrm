import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  imported: any[];
}

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {
  selectedCustomerFile: File | null = null;
  selectedMeterFile: File | null = null;

  customerImportResult: ImportResult | null = null;
  meterImportResult: ImportResult | null = null;

  isImportingCustomers = false;
  isImportingMeters = false;

  constructor(private http: HttpClient) {}

  onCustomerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCustomerFile = input.files[0];
      this.customerImportResult = null;
    }
  }

  onMeterFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedMeterFile = input.files[0];
      this.meterImportResult = null;
    }
  }

  importCustomers(): void {
    if (!this.selectedCustomerFile) {
      alert('Bitte wählen Sie eine Datei aus');
      return;
    }

    this.isImportingCustomers = true;
    const formData = new FormData();
    formData.append('file', this.selectedCustomerFile);

    this.http.post<{ success: boolean; message: string; data: ImportResult }>(
      `${environment.apiUrl}/import/customers`,
      formData
    ).subscribe({
      next: (response) => {
        this.customerImportResult = response.data;
        this.isImportingCustomers = false;
        this.selectedCustomerFile = null;
        // Reset file input
        const input = document.getElementById('customerFileInput') as HTMLInputElement;
        if (input) input.value = '';
      },
      error: (error) => {
        console.error('Fehler beim Import:', error);
        alert(error.error?.message || 'Fehler beim Importieren der Kunden');
        this.isImportingCustomers = false;
      }
    });
  }

  importMeters(): void {
    if (!this.selectedMeterFile) {
      alert('Bitte wählen Sie eine Datei aus');
      return;
    }

    this.isImportingMeters = true;
    const formData = new FormData();
    formData.append('file', this.selectedMeterFile);

    this.http.post<{ success: boolean; message: string; data: ImportResult }>(
      `${environment.apiUrl}/import/meters`,
      formData
    ).subscribe({
      next: (response) => {
        this.meterImportResult = response.data;
        this.isImportingMeters = false;
        this.selectedMeterFile = null;
        // Reset file input
        const input = document.getElementById('meterFileInput') as HTMLInputElement;
        if (input) input.value = '';
      },
      error: (error) => {
        console.error('Fehler beim Import:', error);
        alert(error.error?.message || 'Fehler beim Importieren der Zähler');
        this.isImportingMeters = false;
      }
    });
  }
}

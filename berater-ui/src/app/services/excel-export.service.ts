import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Customer } from './customer.service';
import { Meter, MeterType } from '../models/meter.model';
import { Contract, stateToLabel, ContractState } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() {}

  /**
   * Exportiert Kundendaten als Excel-Datei
   */
  exportCustomers(customers: Customer[], filename: string = 'Kunden'): void {
    const data = customers.map(customer => ({
      'Kundennummer': customer.customerNumber || '',
      'Anrede': customer.anrede || '',
      'Vorname': customer.firstName || '',
      'Nachname': customer.lastName || '',
      'E-Mail': customer.email || '',
      'Telefon': customer.phone || '',
      'Straße': customer.address?.street || '',
      'PLZ': customer.address?.zip || '',
      'Stadt': customer.address?.city || '',
      'Land': customer.address?.country || 'Deutschland',
      'Geburtsdatum': customer.dateOfBirth ? this.formatDate(customer.dateOfBirth) : '',
      'Notizen': customer.notes || '',
      'Status': customer.isActive ? 'Aktiv' : 'Inaktiv',
      'Erstellt am': this.formatDate(customer.createdAt)
    }));

    this.downloadExcel(data, filename);
  }

  /**
   * Exportiert Zählerdaten als Excel-Datei
   */
  exportMeters(meters: Meter[], filename: string = 'Zähler'): void {
    const data = meters.map(meter => ({
      'Zählernummer': meter.meterNumber || '',
      'MALO-ID': meter.maloId || '',
      'Typ': this.getMeterTypeLabel(meter.type),
      'Hersteller': meter.manufacturer || '',
      'Zweitarif': meter.isTwoTariff ? 'Ja' : 'Nein',
      'Status': meter.isFree ? 'Frei' : 'Zugewiesen',
      'Kunde': this.getCustomerName(meter.currentCustomerId),
      'Aktueller Zählerstand': meter.currentReading ?? '',
      'Zählerstand HT': meter.currentReadingHT ?? '',
      'Zählerstand NT': meter.currentReadingNT ?? '',
      'Letzte Ablesung': meter.lastReadingDate ? this.formatDate(meter.lastReadingDate) : '',
      'Straße': meter.location?.street || '',
      'PLZ': meter.location?.zip || '',
      'Stadt': meter.location?.city || '',
      'Installationsdatum': meter.installationDate ? this.formatDate(meter.installationDate) : '',
      'Notizen': meter.notes || '',
      'Erstellt am': this.formatDate(meter.createdAt)
    }));

    this.downloadExcel(data, filename);
  }

  /**
   * Exportiert Vertragsdaten als Excel-Datei
   */
  exportContracts(contracts: Contract[], filename: string = 'Verträge'): void {
    const data = contracts.map(contract => ({
      'Vertragsnummer': contract.contractNumber || '',
      'Anbieter-Vertragsnummer': contract.supplierContractNumber || '',
      'Status': stateToLabel[contract.status as ContractState] || contract.status,
      'Kunde': this.getCustomerName(contract.customerId),
      'Zählernummer': this.getMeterNumber(contract.meterId),
      'Anbieter': this.getSupplierName(contract.supplierId),
      'Gewerbekunde': contract.isCommercial ? 'Ja' : 'Nein',
      'Firmenname': contract.commercialName || '',
      'Startdatum': this.formatDate(contract.startDate),
      'Enddatum': this.formatDate(contract.endDate),
      'Laufzeit (Monate)': contract.durationMonths || '',
      'Verbleibende Tage': contract.daysRemaining ?? '',
      'Notizen': contract.notes || '',
      'Erstellt am': this.formatDate(contract.createdAt)
    }));

    this.downloadExcel(data, filename);
  }

  /**
   * Generiert und lädt die Excel-Datei herunter
   */
  private downloadExcel(data: any[], filename: string): void {
    // Erstelle Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Spaltenbreiten automatisch anpassen
    const columnWidths = this.calculateColumnWidths(data);
    worksheet['!cols'] = columnWidths;

    // Erstelle Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daten');

    // Generiere Dateiname mit Datum
    const date = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${date}.xlsx`;

    // Download
    XLSX.writeFile(workbook, fullFilename);
  }

  /**
   * Berechnet optimale Spaltenbreiten
   */
  private calculateColumnWidths(data: any[]): { wch: number }[] {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map(key => {
      // Header-Breite
      let maxWidth = key.length;

      // Prüfe alle Datenwerte
      data.forEach(row => {
        const value = row[key];
        if (value !== null && value !== undefined) {
          const length = String(value).length;
          if (length > maxWidth) {
            maxWidth = length;
          }
        }
      });

      // Minimum 10, Maximum 50 Zeichen
      return { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
    });
  }

  /**
   * Formatiert ein Datum für die Anzeige
   */
  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Gibt den Kundennamen zurück
   */
  private getCustomerName(customer: any): string {
    if (!customer) return '';
    if (typeof customer === 'string') return customer;
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  }

  /**
   * Gibt die Zählernummer zurück
   */
  private getMeterNumber(meter: any): string {
    if (!meter) return '';
    if (typeof meter === 'string') return meter;
    return meter.meterNumber || '';
  }

  /**
   * Gibt den Anbieternamen zurück
   */
  private getSupplierName(supplier: any): string {
    if (!supplier) return '';
    if (typeof supplier === 'string') return supplier;
    return supplier.name || '';
  }

  /**
   * Gibt das Label für den Zählertyp zurück
   */
  private getMeterTypeLabel(type: MeterType | string): string {
    const labels: Record<string, string> = {
      [MeterType.Electricity]: 'Strom',
      [MeterType.Gas]: 'Gas',
      [MeterType.Water]: 'Wasser',
      [MeterType.HeatPump]: 'Wärmepumpe',
      [MeterType.NightStorage]: 'Nachtspeicher'
    };
    return labels[type] || type;
  }
}

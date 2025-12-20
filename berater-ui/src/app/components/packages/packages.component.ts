import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageService, Package, UserLimits } from '../../services/package.service';
import { UpgradeService } from '../../services/upgrade.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="packages-container">
      <div class="header">
        <h1>{{ isSuperAdmin ? 'Pakete-Verwaltung' : 'Paket upgraden' }}</h1>
        <button class="btn-primary" (click)="showCreateForm()" *ngIf="isSuperAdmin">
          + Neues Paket
        </button>
      </div>

      <!-- Current Package Info for Berater -->
      <div class="current-package-card" *ngIf="!isSuperAdmin && userLimits">
        <h2>Ihr aktuelles Paket: {{ userLimits.package.displayName }}</h2>
        <div class="limits-overview">
          <div class="limit-overview-item">
            <div class="label">Verträge</div>
            <div class="usage-bar">
              <div class="bar-bg">
                <div class="bar-fill" [style.width.%]="getUsagePercentage('contracts')"
                     [class.warning]="getUsagePercentage('contracts') >= 80"
                     [class.danger]="getUsagePercentage('contracts') >= 100"></div>
              </div>
              <span class="usage-text">{{ userLimits.usage.contracts }} / {{ userLimits.limits.maxContracts === -1 ? '∞' : userLimits.limits.maxContracts }}</span>
            </div>
          </div>
          <div class="limit-overview-item">
            <div class="label">Kunden</div>
            <div class="usage-bar">
              <div class="bar-bg">
                <div class="bar-fill" [style.width.%]="getUsagePercentage('customers')"
                     [class.warning]="getUsagePercentage('customers') >= 80"
                     [class.danger]="getUsagePercentage('customers') >= 100"></div>
              </div>
              <span class="usage-text">{{ userLimits.usage.customers }} / {{ userLimits.limits.maxCustomers === -1 ? '∞' : userLimits.limits.maxCustomers }}</span>
            </div>
          </div>
          <div class="limit-overview-item">
            <div class="label">Zähler</div>
            <div class="usage-bar">
              <div class="bar-bg">
                <div class="bar-fill" [style.width.%]="getUsagePercentage('meters')"
                     [class.warning]="getUsagePercentage('meters') >= 80"
                     [class.danger]="getUsagePercentage('meters') >= 100"></div>
              </div>
              <span class="usage-text">{{ userLimits.usage.meters }} / {{ userLimits.limits.maxMeters === -1 ? '∞' : userLimits.limits.maxMeters }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Form -->
      <div class="form-card" *ngIf="showForm">
        <h2>{{ editingPackage ? 'Paket bearbeiten' : 'Neues Paket erstellen' }}</h2>
        <form (ngSubmit)="savePackage()">
          <div class="form-row">
            <div class="form-group">
              <label>Paket-Name (technisch)</label>
              <input type="text" [(ngModel)]="formData.name" name="name"
                     required [disabled]="!!editingPackage">
            </div>
            <div class="form-group">
              <label>Anzeigename</label>
              <input type="text" [(ngModel)]="formData.displayName" name="displayName" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Max. Verträge</label>
              <input type="number" [(ngModel)]="formData.maxContracts" name="maxContracts" required>
              <small>-1 für unbegrenzt</small>
            </div>
            <div class="form-group">
              <label>Max. Kunden</label>
              <input type="number" [(ngModel)]="formData.maxCustomers" name="maxCustomers" required>
              <small>-1 für unbegrenzt</small>
            </div>
            <div class="form-group">
              <label>Max. Zähler</label>
              <input type="number" [(ngModel)]="formData.maxMeters" name="maxMeters" required>
              <small>-1 für unbegrenzt</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Preis</label>
              <input type="number" step="0.01" [(ngModel)]="formData.price" name="price" required>
            </div>
            <div class="form-group">
              <label>Währung</label>
              <select [(ngModel)]="formData.currency" name="currency">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div class="form-group">
              <label>Abrechnungszeitraum</label>
              <select [(ngModel)]="formData.billingPeriod" name="billingPeriod">
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Reihenfolge</label>
              <input type="number" [(ngModel)]="formData.order" name="order">
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.isFree" name="isFree">
                Kostenloses Paket
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive">
                Aktiv
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Speichern</button>
            <button type="button" class="btn-secondary" (click)="cancelEdit()">Abbrechen</button>
          </div>
        </form>
      </div>

      <!-- Packages List -->
      <div class="packages-grid">
        <div class="package-card" *ngFor="let package of packages"
             [class.inactive]="!package.isActive"
             [class.free]="package.isFree">
          <div class="package-header">
            <h3>{{ package.displayName }}</h3>
            <span class="package-badge" *ngIf="package.isFree">Kostenlos</span>
            <span class="package-badge inactive" *ngIf="!package.isActive">Inaktiv</span>
          </div>

          <div class="package-price">
            <span class="price">{{ package.price | number:'1.2-2' }} {{ package.currency }}</span>
            <span class="period">/ {{ package.billingPeriod === 'monthly' ? 'Monat' : 'Jahr' }}</span>
          </div>

          <div class="package-limits">
            <div class="limit-item">
              <span class="label">Verträge:</span>
              <span class="value">{{ package.maxContracts === -1 ? 'Unbegrenzt' : package.maxContracts }}</span>
            </div>
            <div class="limit-item">
              <span class="label">Kunden:</span>
              <span class="value">{{ package.maxCustomers === -1 ? 'Unbegrenzt' : package.maxCustomers }}</span>
            </div>
            <div class="limit-item">
              <span class="label">Zähler:</span>
              <span class="value">{{ package.maxMeters === -1 ? 'Unbegrenzt' : package.maxMeters }}</span>
            </div>
          </div>

          <div class="package-actions" *ngIf="isSuperAdmin">
            <button class="btn-edit" (click)="editPackage(package)">Bearbeiten</button>
            <button class="btn-delete" (click)="deletePackage(package._id)"
                    *ngIf="!package.isFree">Löschen</button>
          </div>

          <div class="package-actions" *ngIf="!isSuperAdmin">
            <button [class]="package.order < userLimits.package.order ? 'btn-downgrade' : 'btn-upgrade'"
                    (click)="changePackage(package.name, package.order)"
                    *ngIf="userLimits && package.name !== userLimits.package.name">
              {{ package.order < userLimits.package.order ? 'Downgraden' : 'Upgraden' }}
            </button>
            <span class="current-package-badge" *ngIf="userLimits && package.name === userLimits.package.name">
              Aktuelles Paket
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .packages-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }

    .current-package-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .current-package-card h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
    }

    .limits-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .limit-overview-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 8px;
    }

    .limit-overview-item .label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: block;
    }

    .usage-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .bar-bg {
      flex: 1;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #27ae60;
      border-radius: 12px;
      transition: width 0.3s, background 0.3s;
    }

    .bar-fill.warning {
      background: #f39c12;
    }

    .bar-fill.danger {
      background: #e74c3c;
    }

    .usage-text {
      font-weight: 600;
      min-width: 80px;
    }

    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .form-card h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #555;
    }

    .form-group input,
    .form-group select {
      padding: 0.625rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group small {
      color: #888;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .package-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      border: 2px solid transparent;
    }

    .package-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .package-card.free {
      border-color: #27ae60;
    }

    .package-card.inactive {
      opacity: 0.6;
      background: #f5f5f5;
    }

    .package-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .package-header h3 {
      margin: 0;
      color: #333;
      flex: 1;
    }

    .package-badge {
      background: #27ae60;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .package-badge.inactive {
      background: #95a5a6;
    }

    .package-price {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .package-price .price {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }

    .package-price .period {
      color: #888;
      font-size: 0.875rem;
    }

    .package-limits {
      margin-bottom: 1.5rem;
    }

    .limit-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .limit-item .label {
      color: #666;
      font-weight: 500;
    }

    .limit-item .value {
      color: #333;
      font-weight: 600;
    }

    .package-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .current-package-badge {
      background: #27ae60;
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
      flex: 1;
    }

    .btn-primary, .btn-secondary, .btn-edit, .btn-delete, .btn-upgrade {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #555;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-edit {
      background: #3498db;
      color: white;
      flex: 1;
    }

    .btn-edit:hover {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
      flex: 1;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .btn-upgrade {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex: 1;
    }

    .btn-upgrade:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .btn-upgrade:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-downgrade {
      background: #f39c12;
      color: white;
      flex: 1;
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-downgrade:hover {
      background: #e67e22;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
    }
  `]
})
export class PackagesComponent implements OnInit {
  packages: Package[] = [];
  showForm = false;
  editingPackage: Package | null = null;
  isSuperAdmin = false;
  userLimits: UserLimits | null = null;

  formData: Partial<Package> = {
    name: '',
    displayName: '',
    maxContracts: 10,
    maxCustomers: 10,
    maxMeters: 10,
    price: 0,
    currency: 'EUR',
    billingPeriod: 'monthly',
    isActive: true,
    isFree: false,
    order: 1
  };

  constructor(
    private packageService: PackageService,
    private upgradeService: UpgradeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isSuperAdmin = user?.role === 'superadmin';
      if (!this.isSuperAdmin) {
        this.loadUserLimits();
      }
    });
    this.loadPackages();
  }

  loadUserLimits(): void {
    this.packageService.getUserLimits().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userLimits = response.data;
        }
      },
      error: (error: any) => console.error('Error loading user limits:', error)
    });
  }

  loadPackages(): void {
    this.packageService.getAllPackages().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.packages = response.data.sort((a: Package, b: Package) => a.order - b.order);
        }
      },
      error: (error: any) => console.error('Error loading packages:', error)
    });
  }

  showCreateForm(): void {
    this.editingPackage = null;
    this.formData = {
      name: '',
      displayName: '',
      maxContracts: 10,
      maxCustomers: 10,
      maxMeters: 10,
      price: 0,
      currency: 'EUR',
      billingPeriod: 'monthly',
      isActive: true,
      isFree: false,
      order: this.packages.length + 1
    };
    this.showForm = true;
  }

  editPackage(pkg: Package): void {
    this.editingPackage = pkg;
    this.formData = { ...pkg };
    this.showForm = true;
  }

  savePackage(): void {
    if (this.editingPackage) {
      this.packageService.updatePackage(this.editingPackage._id, this.formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
            this.cancelEdit();
          }
        },
        error: (error: any) => {
          console.error('Error updating package:', error);
          alert('Fehler beim Aktualisieren des Pakets');
        }
      });
    } else {
      this.packageService.createPackage(this.formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
            this.cancelEdit();
          }
        },
        error: (error: any) => {
          console.error('Error creating package:', error);
          alert('Fehler beim Erstellen des Pakets');
        }
      });
    }
  }

  deletePackage(id: string): void {
    if (confirm('Möchten Sie dieses Paket wirklich löschen?')) {
      this.packageService.deletePackage(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
          }
        },
        error: (error: any) => {
          console.error('Error deleting package:', error);
          alert('Fehler beim Löschen des Pakets');
        }
      });
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingPackage = null;
  }

  getUsagePercentage(type: 'contracts' | 'customers' | 'meters'): number {
    if (!this.userLimits) return 0;

    const usage = this.userLimits.usage[type];
    const limit = this.userLimits.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof this.userLimits.limits] as number;

    if (limit === -1) return 0; // Unlimited
    return (usage / limit) * 100;
  }

  changePackage(packageName: string, packageOrder: number): void {
    const isDowngrade = this.userLimits && packageOrder < this.userLimits.package.order;
    const action = isDowngrade ? 'downgraden' : 'upgraden';

    let confirmMessage = `Möchten Sie wirklich eine ${action}-Anfrage für dieses Paket erstellen?\n\nHinweis: Die Anfrage muss vom Administrator genehmigt werden, nachdem die Zahlung eingegangen ist.`;

    if (isDowngrade) {
      confirmMessage = `ACHTUNG: Sie sind dabei, eine Downgrade-Anfrage zu erstellen.\n\nWenn Ihre aktuelle Nutzung die Limits des neuen Pakets überschreitet, wird die Anfrage abgelehnt.\n\nDie Anfrage muss vom Administrator genehmigt werden.\n\nMöchten Sie fortfahren?`;
    }

    if (confirm(confirmMessage)) {
      this.upgradeService.createUpgradeRequest(packageName).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert(`Upgrade-Anfrage erfolgreich erstellt!\n\nStatus: ${response.data.status}\nGewünschtes Paket: ${response.data.packageDetails.displayName}\nPreis: ${response.data.packageDetails.price} ${response.data.packageDetails.currency}\n\nBitte überweisen Sie den Betrag und laden Sie anschließend den Zahlungsnachweis hoch.\nIhre Anfrage wird nach Zahlungseingang vom Administrator geprüft.`);
            this.loadUserLimits();
            this.loadPackages();
          }
        },
        error: (error: any) => {
          console.error('Error creating upgrade request:', error);
          const errorMessage = error.error?.message || 'Unbekannter Fehler';
          alert('Fehler beim Erstellen der Upgrade-Anfrage: ' + errorMessage);
        }
      });
    }
  }
}

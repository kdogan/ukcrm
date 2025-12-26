import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { PackageService, Package, UserLimits } from '../../services/package.service';
import { UpgradeService } from '../../services/upgrade.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-settings',
    imports: [CommonModule, FormsModule],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Einstellungen</h1>
      </div>

      <div class="settings-content">
        <!-- Erinnerungen für Vertragsablauf -->
        <div class="settings-section">
          <h2>📅 Erinnerungen für Vertragsablauf</h2>
          <p class="section-description">
            Wählen Sie aus, wann Sie vor Vertragsablauf benachrichtigt werden möchten.
          </p>

          <div class="setting-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days90"
                (change)="saveSettings()"
              />
              <span>90 Tage vor Ablauf</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days60"
                (change)="saveSettings()"
              />
              <span>60 Tage vor Ablauf</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days30"
                (change)="saveSettings()"
              />
              <span>30 Tage vor Ablauf</span>
            </label>

            <div class="custom-days">
              <label>Benutzerdefiniert (Tage vor Ablauf):</label>
              <input
                type="number"
                [(ngModel)]="settings.reminderDays.custom"
                (change)="saveSettings()"
                min="1"
                max="365"
                placeholder="z.B. 45"
                class="input-small"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar-Bezeichnungen -->
        <div class="settings-section">
          <h2>🎨 Sidebar-Bezeichnungen anpassen</h2>
          <p class="section-description">
            Passen Sie die Bezeichnungen in der Sidebar nach Ihren Wünschen an.
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>Dashboard:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.dashboard"
                (blur)="saveSettings()"
                placeholder="Dashboard"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>Kunden:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.customers"
                (blur)="saveSettings()"
                placeholder="Kunden"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>Zähler:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.meters"
                (blur)="saveSettings()"
                placeholder="Zähler"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>Verträge:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.contracts"
                (blur)="saveSettings()"
                placeholder="Verträge"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>TODOs:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.todos"
                (blur)="saveSettings()"
                placeholder="TODOs"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>Anbieter:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.suppliers"
                (blur)="saveSettings()"
                placeholder="Anbieter"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <!-- Benachrichtigungseinstellungen -->
        <div class="settings-section">
          <h2>🔔 Benachrichtigungen</h2>
          <p class="section-description">
            Wählen Sie aus, wie Sie benachrichtigt werden möchten.
          </p>

          <div class="setting-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.email"
                (change)="saveSettings()"
              />
              <span>E-Mail-Benachrichtigungen</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.browser"
                (change)="saveSettings()"
              />
              <span>Browser-Benachrichtigungen</span>
            </label>
          </div>
        </div>

        <!-- Theme/Farben -->
        <div class="settings-section">
          <h2>🎨 Erscheinungsbild</h2>
          <p class="section-description">
            Passen Sie das Aussehen der Anwendung an.
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>Sidebar-Farbe:</label>
              <select
                [(ngModel)]="settings.theme.sidebarColor"
                (change)="saveSettings()"
                class="input-field"
              >
                <option value="mint">Mintgrün (Standard)</option>
                <option value="blue">Blau</option>
                <option value="purple">Lila</option>
                <option value="orange">Orange</option>
                <option value="red">Rot</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Paket-Verwaltung -->
        <div class="settings-section">
          <h2>📦 Ihr Paket</h2>
          <p class="section-description">
            Verwalten Sie Ihr aktuelles Paket und sehen Sie Ihre Nutzung.
          </p>

          <div *ngIf="userLimits" class="package-info">
            <div class="current-package">
              <div class="package-header">
                <h3>{{ userLimits.package.displayName }}</h3>
                <span class="package-price">{{ userLimits.package.price | number:'1.2-2' }} {{ userLimits.package.currency }} / {{ userLimits.package.billingPeriod === 'monthly' ? 'Monat' : 'Jahr' }}</span>
              </div>

              <div class="usage-section">
                <div class="usage-item">
                  <div class="usage-label">Verträge</div>
                  <div class="usage-bar-container">
                    <div class="usage-bar-bg">
                      <div class="usage-bar-fill"
                           [style.width.%]="getUsagePercentage('contracts')"
                           [class.warning]="getUsagePercentage('contracts') >= 80"
                           [class.danger]="getUsagePercentage('contracts') >= 100"></div>
                    </div>
                    <span class="usage-text">{{ userLimits.usage.contracts }} / {{ userLimits.limits.maxContracts === -1 ? '∞' : userLimits.limits.maxContracts }}</span>
                  </div>
                </div>

                <div class="usage-item">
                  <div class="usage-label">Kunden</div>
                  <div class="usage-bar-container">
                    <div class="usage-bar-bg">
                      <div class="usage-bar-fill"
                           [style.width.%]="getUsagePercentage('customers')"
                           [class.warning]="getUsagePercentage('customers') >= 80"
                           [class.danger]="getUsagePercentage('customers') >= 100"></div>
                    </div>
                    <span class="usage-text">{{ userLimits.usage.customers }} / {{ userLimits.limits.maxCustomers === -1 ? '∞' : userLimits.limits.maxCustomers }}</span>
                  </div>
                </div>

                <div class="usage-item">
                  <div class="usage-label">Zähler</div>
                  <div class="usage-bar-container">
                    <div class="usage-bar-bg">
                      <div class="usage-bar-fill"
                           [style.width.%]="getUsagePercentage('meters')"
                           [class.warning]="getUsagePercentage('meters') >= 80"
                           [class.danger]="getUsagePercentage('meters') >= 100"></div>
                    </div>
                    <span class="usage-text">{{ userLimits.usage.meters }} / {{ userLimits.limits.maxMeters === -1 ? '∞' : userLimits.limits.maxMeters }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="available-packages">
              <h3>Verfügbare Pakete</h3>

              <!-- Pending Upgrade Request Info Banner -->
              <div *ngIf="pendingUpgradeRequest" class="upgrade-pending-banner">
                <div class="banner-icon">⏳</div>
                <div class="banner-content">
                  <div class="banner-title">
                    Upgrade-Anfrage wird bearbeitet
                  </div>
                  <div class="banner-message">
                    Ihr Upgrade auf <strong>{{ pendingUpgradeRequest.packageDetails.displayName }}</strong>
                    <span *ngIf="pendingUpgradeRequest.status === 'pending'">wurde erstellt und wartet auf Zahlung.</span>
                    <span *ngIf="pendingUpgradeRequest.status === 'payment_received'">wird vom Administrator geprüft.</span>
                  </div>
                  <div class="banner-details">
                    <span class="detail-item">Preis: {{ pendingUpgradeRequest.packageDetails.price }} {{ pendingUpgradeRequest.packageDetails.currency }}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">Status: {{ getStatusLabel(pendingUpgradeRequest.status) }}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">Erstellt: {{ formatDate(pendingUpgradeRequest.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="packages-grid">
                <div *ngFor="let pkg of packages"
                     class="package-card"
                     [class.current]="pkg.name === userLimits.package.name"
                     [class.pending-upgrade]="pendingUpgradeRequest && pkg.name === pendingUpgradeRequest.requestedPackage">
                  <div class="package-card-header">
                    <h4>{{ pkg.displayName }}</h4>
                    <span class="current-badge" *ngIf="pkg.name === userLimits.package.name">Aktuell</span>
                    <span class="pending-badge" *ngIf="pendingUpgradeRequest && pkg.name === pendingUpgradeRequest.requestedPackage">Beantragt</span>
                  </div>
                  <div class="package-price-tag">{{ pkg.price | number:'1.2-2' }} {{ pkg.currency }}/{{ pkg.billingPeriod === 'monthly' ? 'Monat' : 'Jahr' }}</div>
                  <div class="package-features">
                    <div class="feature">✓ {{ pkg.maxContracts === -1 ? 'Unbegrenzt' : pkg.maxContracts }} Verträge</div>
                    <div class="feature">✓ {{ pkg.maxCustomers === -1 ? 'Unbegrenzt' : pkg.maxCustomers }} Kunden</div>
                    <div class="feature">✓ {{ pkg.maxMeters === -1 ? 'Unbegrenzt' : pkg.maxMeters }} Zähler</div>
                  </div>
                  <button *ngIf="pkg.name !== userLimits.package.name && !pendingUpgradeRequest"
                          [class]="pkg.order < userLimits.package.order ? 'btn-downgrade' : 'btn-upgrade'"
                          (click)="changePackage(pkg.name, pkg.order)">
                    {{ pkg.order < userLimits.package.order ? 'Downgraden' : 'Upgraden' }}
                  </button>
                  <button *ngIf="pendingUpgradeRequest && pkg.name !== userLimits.package.name"
                          class="btn-disabled"
                          disabled>
                    {{ pkg.name === pendingUpgradeRequest.requestedPackage ? 'In Bearbeitung...' : 'Nicht verfügbar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aktionen -->
        <div class="settings-actions">
          <button class="btn-secondary" (click)="resetToDefaults()">
            Auf Standardwerte zurücksetzen
          </button>
          <button class="btn-primary" (click)="saveSettings()">
            Änderungen speichern
          </button>
        </div>

        <div class="save-indicator" *ngIf="showSaveIndicator">
          ✓ Einstellungen gespeichert
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .settings-section h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .section-description {
      color: #666;
      font-size: 0.95rem;
      margin: 0 0 1.5rem 0;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .checkbox-label:hover {
      background: #f8f9fa;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .checkbox-label span {
      font-size: 1rem;
      color: #333;
    }

    .custom-days {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .custom-days label {
      font-size: 0.95rem;
      color: #555;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-group label {
      font-size: 0.95rem;
      font-weight: 600;
      color: #555;
    }

    .input-field {
      width: 100%;
      max-width: 400px;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .input-field:focus {
      outline: none;
      border-color: #34d399;
    }

    .input-small {
      width: 120px;
      padding: 0.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .input-small:focus {
      outline: none;
      border-color: #34d399;
    }

    .settings-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem 0;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-primary {
      background: #34d399;
      color: white;
    }

    .btn-primary:hover {
      background: #10b981;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #555;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .save-indicator {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      font-weight: 600;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Package Management Styles */
    .package-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .current-package {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
    }

    .package-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .package-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .package-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #34d399;
    }

    .usage-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .usage-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .usage-label {
      font-weight: 600;
      color: #555;
      font-size: 0.95rem;
    }

    .usage-bar-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .usage-bar-bg {
      flex: 1;
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
    }

    .usage-bar-fill {
      height: 100%;
      background: #34d399;
      transition: width 0.3s, background 0.3s;
      border-radius: 12px;
    }

    .usage-bar-fill.warning {
      background: #fbbf24;
    }

    .usage-bar-fill.danger {
      background: #ef4444;
    }

    .usage-text {
      min-width: 80px;
      text-align: right;
      font-weight: 600;
      color: #555;
    }

    .available-packages {
      margin-top: 1rem;
    }

    .available-packages h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      color: #333;
    }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .package-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .package-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .package-card.current {
      border-color: #34d399;
      background: #f0fdf4;
    }

    .package-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .package-card-header h4 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    .current-badge {
      background: #34d399;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .pending-badge {
      background: #f59e0b;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .package-card.pending-upgrade {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .package-price-tag {
      font-size: 1.5rem;
      font-weight: 700;
      color: #34d399;
    }

    .package-features {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .feature {
      color: #555;
      font-size: 0.95rem;
    }

    .btn-upgrade, .btn-downgrade {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
      width: 100%;
    }

    .btn-upgrade {
      background: #34d399;
      color: white;
    }

    .btn-upgrade:hover {
      background: #10b981;
    }

    .btn-downgrade {
      background: #fbbf24;
      color: white;
    }

    .btn-downgrade:hover {
      background: #f59e0b;
    }

    .btn-disabled {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      width: 100%;
      background: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .upgrade-pending-banner {
      display: flex;
      gap: 1rem;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
    }

    .banner-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .banner-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .banner-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #92400e;
    }

    .banner-message {
      font-size: 1rem;
      color: #78350f;
      line-height: 1.5;
    }

    .banner-message strong {
      color: #92400e;
      font-weight: 700;
    }

    .banner-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #78350f;
    }

    .detail-item {
      font-weight: 500;
    }

    .detail-separator {
      color: #d97706;
      font-weight: 700;
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings!: UserSettings;
  showSaveIndicator = false;
  userLimits: UserLimits | null = null;
  packages: Package[] = [];
  pendingUpgradeRequest: any = null;

  constructor(
    private settingsService: SettingsService,
    private packageService: PackageService,
    private upgradeService: UpgradeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();

    // Nur Limits und Pakete laden, wenn der Benutzer eingeloggt ist
    if (this.authService.isAuthenticated()) {
      this.loadUserLimits();
      this.loadPackages();
      this.loadPendingUpgradeRequest();
    }
  }

  loadPendingUpgradeRequest(): void {
    this.upgradeService.getMyUpgradeRequests().subscribe({
      next: (response: any) => {
        if (response.success && response.data.length > 0) {
          // Finde die erste ausstehende Anfrage (pending oder payment_received)
          this.pendingUpgradeRequest = response.data.find((req: any) =>
            req.status === 'pending' || req.status === 'payment_received'
          );
        }
      },
      error: (err: any) => {
        console.error('Error loading upgrade requests:', err);
      }
    });
  }

  loadUserLimits(): void {
    this.packageService.getUserLimits().subscribe({
      next: (response) => {
        this.userLimits = response.data;
      },
      error: (err) => {
        console.error('Error loading user limits:', err);
        // Bei 401-Fehler wird der Interceptor den Benutzer ausloggen
      }
    });
  }

  loadPackages(): void {
    this.packageService.getAllPackages().subscribe({
      next: (response) => {
        this.packages = response.data.filter((pkg: Package) => pkg.isActive);
      },
      error: (err) => {
        console.error('Error loading packages:', err);
        // Bei 401-Fehler wird der Interceptor den Benutzer ausloggen
      }
    });
  }

  getUsagePercentage(type: 'contracts' | 'customers' | 'meters'): number {
    if (!this.userLimits) return 0;

    const usage = this.userLimits.usage[type];
    const limit = this.userLimits.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof this.userLimits.limits];

    if (limit === -1) return 0;
    return Math.min(100, (usage / (limit as number)) * 100);
  }

  changePackage(packageName: string, order: number): void {
    const currentOrder = this.userLimits?.package.order || 0;
    const action = order < currentOrder ? 'Downgrade' : 'Upgrade';

    if (confirm(`Möchten Sie wirklich eine ${action === 'Upgrade' ? 'Upgrade' : 'Downgrade'}-Anfrage für dieses Paket erstellen?\n\nHinweis: Die Anfrage muss vom Administrator genehmigt werden, nachdem die Zahlung eingegangen ist.`)) {
      this.upgradeService.createUpgradeRequest(packageName).subscribe({
        next: (response: any) => {
          alert(`Upgrade-Anfrage erfolgreich erstellt!\n\nStatus: ${response.data.status}\nGewünschtes Paket: ${response.data.packageDetails.displayName}\nPreis: ${response.data.packageDetails.price} ${response.data.packageDetails.currency}\n\nBitte überweisen Sie den Betrag und laden Sie anschließend den Zahlungsnachweis hoch.\nIhre Anfrage wird nach Zahlungseingang vom Administrator geprüft.`);
          this.loadUserLimits();
          this.loadPendingUpgradeRequest();
        },
        error: (err: any) => {
          console.error('Error creating upgrade request:', err);
          alert(err.error?.message || 'Fehler beim Erstellen der Upgrade-Anfrage');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Neu',
      payment_received: 'Zahlung erhalten',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      cancelled: 'Storniert'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  saveSettings(): void {
    this.settingsService.saveSettings(this.settings).subscribe({
      next: () => {
        this.showSaveIndicator = true;
        setTimeout(() => {
          this.showSaveIndicator = false;
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        alert('Fehler beim Speichern der Einstellungen');
      }
    });
  }

  resetToDefaults(): void {
    if (confirm('Möchten Sie wirklich alle Einstellungen auf die Standardwerte zurücksetzen?')) {
      this.settingsService.resetToDefaults().subscribe({
        next: () => {
          this.settings = this.settingsService.getSettings();
          this.showSaveIndicator = true;
          setTimeout(() => {
            this.showSaveIndicator = false;
          }, 2000);
        },
        error: (err) => {
          console.error('Error resetting settings:', err);
          alert('Fehler beim Zurücksetzen der Einstellungen');
        }
      });
    }
  }
}

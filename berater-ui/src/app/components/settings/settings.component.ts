import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { PackageService, Package, UserLimits } from '../../services/package.service';
import { UpgradeService } from '../../services/upgrade.service';
import { AuthService } from '../../services/auth.service';
import { ViewportService } from 'src/app/services/viewport.service';
import { SettingsMobileComponent } from './mobile/settings-mobile.component';
import { PaypalService } from '../../services/paypal.service';
import { LanguageService, Language } from '../../services/language.service';

@Component({
    selector: 'app-settings',
    imports: [CommonModule, FormsModule, SettingsMobileComponent, TranslateModule],
    standalone: true,
    template: `
    @if(isMobile){
      <app-settings-mobile
        [settings]="settings"
        [userLimits]="userLimits"
        [packages]="packages"
        [pendingUpgradeRequest]="pendingUpgradeRequest"
        [selectedBillingInterval]="selectedBillingInterval"
        [currentPassword]="currentPassword"
        [newPassword]="newPassword"
        [confirmPassword]="confirmPassword"
        [isChangingPassword]="isChangingPassword"
        (saveSettingsEvent)="saveSettings()"
        (resetToDefaultsEvent)="resetToDefaults()"
        (changePackageEvent)="changePackage($event.packageName, $event.order)"
        (selectBillingIntervalEvent)="selectBillingInterval($any($event).packageName, $any($event).interval)"
        (changePasswordEvent)="changePassword()"
        (currentPasswordChange)="currentPassword = $any($event)"
        (newPasswordChange)="newPassword = $any($event)"
        (confirmPasswordChange)="confirmPassword = $any($event)"
      ></app-settings-mobile>
    } @else {
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'SETTINGS.TITLE' | translate }}</h1>
      </div>

      <div class="settings-content">
        <!-- Erinnerungen für Vertragsablauf -->
        <div class="settings-section">
          <h2>📅 {{ 'SETTINGS.REMINDERS.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.REMINDERS.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <!-- <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days90"
                (change)="saveSettings()"
              />
              <span>{{ 'SETTINGS.REMINDERS.DAYS_90' | translate }}</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days60"
                (change)="saveSettings()"
              />
              <span>{{ 'SETTINGS.REMINDERS.DAYS_60' | translate }}</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.days30"
                (change)="saveSettings()"
              />
              <span>{{ 'SETTINGS.REMINDERS.DAYS_30' | translate }}</span>
            </label> -->

            <div class="custom-days">
              <label>{{ 'SETTINGS.REMINDERS.CUSTOM_DAYS' | translate }}: {{ settings.reminderDays.custom || 1 }} {{ 'SETTINGS.REMINDERS.DAYS_BEFORE' | translate }}</label>
              <div class="slider-container">
                <span class="slider-label">1</span>
                <input
                  type="range"
                  [(ngModel)]="settings.reminderDays.custom"
                  (change)="saveSettings()"
                  min="1"
                  max="90"
                  step="1"
                  class="slider"
                />
                <span class="slider-label">90</span>
              </div>
            </div>

            <label class="checkbox-label email-reminder-checkbox">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.sendEmail"
                (change)="saveSettings()"
              />
              <span>📧 {{ 'SETTINGS.REMINDERS.EMAIL_NOTIFY' | translate }}</span>
            </label>
          </div>
        </div>

        <!-- Sidebar-Bezeichnungen -->
        <div class="settings-section">
          <h2>🎨 {{ 'SETTINGS.SIDEBAR.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.SIDEBAR.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>{{ 'NAV.DASHBOARD' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.dashboard"
                (blur)="saveSettings()"
                [placeholder]="'NAV.DASHBOARD' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'NAV.CUSTOMERS' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.customers"
                (blur)="saveSettings()"
                [placeholder]="'NAV.CUSTOMERS' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'NAV.METERS' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.meters"
                (blur)="saveSettings()"
                [placeholder]="'NAV.METERS' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'NAV.CONTRACTS' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.contracts"
                (blur)="saveSettings()"
                [placeholder]="'NAV.CONTRACTS' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'NAV.TODOS' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.todos"
                (blur)="saveSettings()"
                [placeholder]="'NAV.TODOS' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'NAV.SUPPLIERS' | translate }}:</label>
              <input
                type="text"
                [(ngModel)]="settings.sidebarLabels.suppliers"
                (blur)="saveSettings()"
                [placeholder]="'NAV.SUPPLIERS' | translate"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <!-- Benachrichtigungseinstellungen -->
        <div class="settings-section">
          <h2>🔔 {{ 'SETTINGS.NOTIFICATIONS.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.NOTIFICATIONS.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.email"
                (change)="saveSettings()"
              />
              <span>{{ 'SETTINGS.NOTIFICATIONS.EMAIL' | translate }}</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.browser"
                (change)="saveSettings()"
              />
              <span>{{ 'SETTINGS.NOTIFICATIONS.BROWSER' | translate }}</span>
            </label>
          </div>
        </div>

        <!-- Theme/Farben -->
        <div class="settings-section">
          <h2>🎨 {{ 'SETTINGS.APPEARANCE.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.APPEARANCE.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>{{ 'SETTINGS.APPEARANCE.SIDEBAR_COLOR' | translate }}:</label>
              <select
                [(ngModel)]="settings.theme.sidebarColor"
                (change)="saveSettings()"
                class="input-field"
              >
                <option value="mint">{{ 'SETTINGS.APPEARANCE.COLORS.MINT' | translate }}</option>
                <option value="blue">{{ 'SETTINGS.APPEARANCE.COLORS.BLUE' | translate }}</option>
                <option value="purple">{{ 'SETTINGS.APPEARANCE.COLORS.PURPLE' | translate }}</option>
                <option value="orange">{{ 'SETTINGS.APPEARANCE.COLORS.ORANGE' | translate }}</option>
                <option value="red">{{ 'SETTINGS.APPEARANCE.COLORS.RED' | translate }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>{{ 'SETTINGS.APPEARANCE.PRIMARY_COLOR' | translate }}:</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  [(ngModel)]="settings.theme.primaryColor"
                  (change)="saveSettings()"
                  class="color-input"
                />
                <input
                  type="text"
                  [(ngModel)]="settings.theme.primaryColor"
                  (change)="saveSettings()"
                  class="input-field color-text"
                  placeholder="#667eea"
                  maxlength="7"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <span class="color-preview" [style.background-color]="settings.theme.primaryColor"></span>
              </div>
              <small class="hint">{{ 'SETTINGS.APPEARANCE.PRIMARY_HINT' | translate }}</small>
            </div>

            <div class="input-group">
              <label>{{ 'SETTINGS.APPEARANCE.ACCENT_COLOR' | translate }}:</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  [(ngModel)]="settings.theme.accentColor"
                  (change)="saveSettings()"
                  class="color-input"
                />
                <input
                  type="text"
                  [(ngModel)]="settings.theme.accentColor"
                  (change)="saveSettings()"
                  class="input-field color-text"
                  placeholder="#764ba2"
                  maxlength="7"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <span class="color-preview" [style.background-color]="settings.theme.accentColor"></span>
              </div>
              <small class="hint">{{ 'SETTINGS.APPEARANCE.ACCENT_HINT' | translate }}</small>
            </div>
          </div>
        </div>

        <!-- Sprache -->
        <div class="settings-section">
          <h2>🌐 {{ 'SETTINGS.LANGUAGE.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.LANGUAGE.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>{{ 'SETTINGS.LANGUAGE.SELECT' | translate }}:</label>
              <select
                [(ngModel)]="currentLanguage"
                (change)="changeLanguage()"
                class="input-field"
              >
                <option value="de">🇩🇪 Deutsch</option>
                <option value="tr">🇹🇷 Türkçe</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Paket-Verwaltung -->
        <div class="settings-section">
                      <div class="info-box">
      <i class="fas fa-info-circle"></i>
      <div>
        <p>{{ 'SETTINGS.PACKAGE.FREE_UNTIL' | translate }} <strong>31. März 2026 </strong> {{ 'SETTINGS.PACKAGE.FREE_UNTIL_2' | translate }}</p>
      </div>
    </div>
          <h2>📦 {{ 'SETTINGS.PACKAGE.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.PACKAGE.DESCRIPTION' | translate }}
          </p>

          <div *ngIf="userLimits" class="package-info">
            <div class="current-package">
              <div class="package-header">
                <h3>{{ userLimits.package.displayName }}</h3>
                <span class="package-price">{{ userLimits.package.monthlyPrice | number:'1.2-2' }} {{ userLimits.package.currency }} {{ 'SETTINGS.PACKAGE.PER_MONTH' | translate }}</span>
              </div>

              <div class="usage-section">
                <div class="usage-item">
                  <div class="usage-label">{{ 'SETTINGS.PACKAGE.CONTRACTS' | translate }}</div>
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

                <!-- <div class="usage-item">
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
                </div> -->

                <!-- <div class="usage-item">
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
                </div> -->
              </div>
            </div>

            <div class="available-packages">
              <h3>{{ 'SETTINGS.PACKAGE.AVAILABLE_PACKAGES' | translate }}</h3>

              <!-- Pending Upgrade Request Info Banner -->
              <div *ngIf="pendingUpgradeRequest" class="upgrade-pending-banner">
                <div class="banner-icon">⏳</div>
                <div class="banner-content">
                  <div class="banner-title">
                    {{ 'SETTINGS.PACKAGE.UPGRADE_PENDING' | translate }}
                  </div>
                  <div class="banner-message">
                    {{ 'SETTINGS.PACKAGE.UPGRADE' | translate }}: <strong>{{ pendingUpgradeRequest.packageDetails.displayName }}</strong>
                    <span *ngIf="pendingUpgradeRequest.status === 'pending'">{{ 'SETTINGS.PACKAGE.WAITING_PAYMENT' | translate }}</span>
                    <span *ngIf="pendingUpgradeRequest.status === 'payment_received'">{{ 'SETTINGS.PACKAGE.ADMIN_REVIEW' | translate }}</span>
                  </div>
                  <div class="banner-details">
                    <span class="detail-item">{{ 'SETTINGS.PACKAGE.PRICE' | translate }}: {{ pendingUpgradeRequest.packageDetails.price }} {{ pendingUpgradeRequest.packageDetails.currency }}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">{{ 'SETTINGS.PACKAGE.STATUS' | translate }}: {{ getStatusLabel(pendingUpgradeRequest.status) }}</span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">{{ 'SETTINGS.PACKAGE.CREATED' | translate }}: {{ formatDate(pendingUpgradeRequest.createdAt) }}</span>
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
                    <span class="current-badge" *ngIf="pkg.name === userLimits.package.name">{{ 'SETTINGS.PACKAGE.CURRENT' | translate }}</span>
                    <span class="pending-badge" *ngIf="pendingUpgradeRequest && pkg.name === pendingUpgradeRequest.requestedPackage">{{ 'SETTINGS.PACKAGE.REQUESTED' | translate }}</span>
                  </div>

                  <!-- Billing interval toggle -->
                  <div class="billing-toggle" *ngIf="pkg.name !== userLimits.package.name">
                    <button
                      class="toggle-btn"
                      [class.active]="selectedBillingInterval[pkg.name] === 'monthly'"
                      (click)="selectBillingInterval(pkg.name, 'monthly')">
                      {{ 'SETTINGS.PACKAGE.MONTHLY' | translate }}
                    </button>
                    <button
                      class="toggle-btn"
                      [class.active]="selectedBillingInterval[pkg.name] === 'yearly'"
                      (click)="selectBillingInterval(pkg.name, 'yearly')">
                      {{ 'SETTINGS.PACKAGE.YEARLY' | translate }} <span class="badge-save">{{ 'SETTINGS.PACKAGE.SAVE_2_MONTHS' | translate }}</span>
                    </button>
                  </div>

                  <div class="package-price-tag">
                    <!-- For current package: Always show monthly price -->
                    <span *ngIf="pkg.name === userLimits.package.name">
                      {{ pkg.monthlyPrice | number:'1.2-2' }} {{ pkg.currency }} {{ 'SETTINGS.PACKAGE.PER_MONTH' | translate }}
                    </span>
                    <!-- For other packages: Show based on selection -->
                    <span *ngIf="pkg.name !== userLimits.package.name && selectedBillingInterval[pkg.name] === 'monthly'">
                      {{ pkg.monthlyPrice | number:'1.2-2' }} {{ pkg.currency }} {{ 'SETTINGS.PACKAGE.PER_MONTH' | translate }}
                    </span>
                    <span *ngIf="pkg.name !== userLimits.package.name && selectedBillingInterval[pkg.name] === 'yearly'">
                      {{ pkg.yearlyPrice | number:'1.2-2' }} {{ pkg.currency }} {{ 'SETTINGS.PACKAGE.PER_YEAR' | translate }}
                    </span>
                  </div>

                  <div class="savings-info" *ngIf="selectedBillingInterval[pkg.name] === 'yearly' && pkg.yearlySavings && pkg.name !== userLimits.package.name">
                    {{ 'SETTINGS.PACKAGE.YOU_SAVE' | translate }} {{ pkg.yearlySavings | number:'1.2-2' }} {{ pkg.currency }}
                  </div>

                  <div class="package-features">
                    <div class="feature">✓ {{ pkg.maxContracts === -1 ? ('SETTINGS.PACKAGE.UNLIMITED' | translate) : pkg.maxContracts }} {{ 'SETTINGS.PACKAGE.CONTRACTS' | translate }}</div>
                    <div class="feature" [class.feature-enabled]="isFileUploadEnabled(pkg)" [class.feature-disabled]="!isFileUploadEnabled(pkg)">
                      {{ isFileUploadEnabled(pkg) ? '✓' : '✗' }} {{ 'SETTINGS.PACKAGE.FILE_UPLOAD' | translate }} {{ isFileUploadEnabled(pkg) ? ('SETTINGS.PACKAGE.ALLOWED' | translate) : ('SETTINGS.PACKAGE.NOT_ALLOWED' | translate) }}
                    </div>
                  </div>
                  <button *ngIf="pkg.name !== userLimits.package.name && !pendingUpgradeRequest"
                          [class]="pkg.order < userLimits.package.order ? 'btn-downgrade' : 'btn-upgrade'"
                          (click)="changePackage(pkg.name, pkg.order)">
                    {{ pkg.order < userLimits.package.order ? ('SETTINGS.PACKAGE.DOWNGRADE' | translate) : ('SETTINGS.PACKAGE.UPGRADE' | translate) }}
                  </button>
                  <button *ngIf="pendingUpgradeRequest && pkg.name !== userLimits.package.name"
                          class="btn-disabled"
                          disabled>
                    {{ pkg.name === pendingUpgradeRequest.requestedPackage ? ('SETTINGS.PACKAGE.IN_PROGRESS' | translate) : ('SETTINGS.PACKAGE.NOT_AVAILABLE' | translate) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Passwort ändern -->
        <div class="settings-section">
          <h2>🔒 {{ 'SETTINGS.PASSWORD.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.PASSWORD.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>{{ 'SETTINGS.PASSWORD.CURRENT' | translate }} *</label>
              <input
                type="password"
                [(ngModel)]="currentPassword"
                [placeholder]="'SETTINGS.PASSWORD.CURRENT' | translate"
                class="input-field"
                autocomplete="current-password"
              />
            </div>

            <div class="input-group">
              <label>{{ 'SETTINGS.PASSWORD.NEW' | translate }} *</label>
              <input
                type="password"
                [(ngModel)]="newPassword"
                [placeholder]="('SETTINGS.PASSWORD.NEW' | translate) + ' (' + ('SETTINGS.PASSWORD.MIN_CHARS' | translate) + ')'"
                class="input-field"
                autocomplete="new-password"
              />
            </div>

            <div class="input-group">
              <label>{{ 'SETTINGS.PASSWORD.CONFIRM' | translate }} *</label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                [placeholder]="'SETTINGS.PASSWORD.CONFIRM' | translate"
                class="input-field"
                autocomplete="new-password"
              />
            </div>

            <button
              class="btn-primary"
              (click)="changePassword()"
              [disabled]="isChangingPassword || !currentPassword || !newPassword || !confirmPassword">
              <i class="fas" [class.fa-spinner]="isChangingPassword" [class.fa-spin]="isChangingPassword" [class.fa-key]="!isChangingPassword"></i>
              {{ isChangingPassword ? ('SETTINGS.PASSWORD.CHANGING' | translate) : ('SETTINGS.PASSWORD.CHANGE' | translate) }}
            </button>
          </div>
        </div>

        <!-- Aktionen -->
        <div class="settings-actions">
          <button class="btn-secondary" (click)="resetToDefaults()">
            {{ 'SETTINGS.ACTIONS.RESET' | translate }}
          </button>
          <button class="btn-primary" (click)="saveSettings()">
            {{ 'SETTINGS.ACTIONS.SAVE' | translate }}
          </button>
        </div>

        <div class="save-indicator" *ngIf="showSaveIndicator">
          ✓ {{ 'SETTINGS.ACTIONS.SAVED' | translate }}
        </div>
      </div>
    </div>
    }
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
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .custom-days label {
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .slider-label {
      min-width: 30px;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
    }

    .slider {
      flex: 1;
      height: 8px;
      border-radius: 5px;
      background: linear-gradient(to right, #e0e0e0, #34d399);
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #34d399;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 3px 8px rgba(52, 211, 153, 0.4);
    }

    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #34d399;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .slider::-moz-range-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 3px 8px rgba(52, 211, 153, 0.4);
    }

    .slider::-moz-range-track {
      background: linear-gradient(to right, #e0e0e0, #34d399);
      border-radius: 5px;
    }

    .email-reminder-checkbox {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #f0f9ff;
      border: 2px solid #bfdbfe;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: #e0f2fe;
        border-color: #3b82f6;
      }

      span {
        font-size: 0.95rem;
        font-weight: 500;
        color: #1e40af;
      }
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

    .billing-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      background: #f5f5f5;
      padding: 0.25rem;
      border-radius: 8px;
    }

    .toggle-btn {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #666;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
    }

    .toggle-btn.active {
      background: white;
      color: #34d399;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
    }

    .badge-save {
      display: inline-block;
      background: #34d399;
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      margin-left: 0.25rem;
    }

    .package-price-tag {
      font-size: 1.5rem;
      font-weight: 700;
      color: #34d399;
      margin-bottom: 0.5rem;
    }

    .savings-info {
      text-align: center;
      color: #34d399;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 1rem;
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

    .feature.feature-enabled {
      color: #27ae60;
    }

    .feature.feature-disabled {
      color: #e74c3c;
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

    .info-box {
  background: linear-gradient(135deg, var(--info-bg) 0%, #f0f7ff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--info-color);
  border-left: 4px solid var(--info-color);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);

  i {
    font-size: 1.5rem;
    margin-top: 0.2rem;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #0d47a1;
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: #1565c0;
    }
  }

  &.admin {
    background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
    color: #856404;
    border-left-color: #ffc107;
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.1);
    align-items: center;

    i {
      margin-top: 0;
    }
  }
}

    /* Color Picker Styles */
    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 400px;
    }

    .color-input {
      width: 60px;
      height: 40px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    .color-input:hover {
      border-color: var(--primary-color);
    }

    .color-text {
      flex: 1;
      max-width: 120px;
      text-transform: uppercase;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hint {
      color: #888;
      font-size: 0.85rem;
      font-style: italic;
      margin-top: 0.25rem;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings!: UserSettings;
  showSaveIndicator = false;
  userLimits: UserLimits | null = null;
  packages: Package[] = [];
  pendingUpgradeRequest: any = null;
  selectedBillingInterval: { [packageName: string]: 'monthly' | 'yearly' } = {};

  // Password change properties
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;

  // Language
  currentLanguage: Language = 'de';

  currentUser: any = null;

  constructor(
    private settingsService: SettingsService,
    private packageService: PackageService,
    private upgradeService: UpgradeService,
    private authService: AuthService,
    private viewport: ViewportService,
    private paypalService: PaypalService,
    private languageService: LanguageService
  ) {}

  get isMobile() {
    return this.viewport.isMobile();
  }

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();

    // Load current language
    this.currentLanguage = this.languageService.getCurrentLanguage();

    // Load current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Nur Limits und Pakete laden, wenn der Benutzer eingeloggt ist
    if (this.authService.isAuthenticated()) {
      this.loadUserLimits();
      this.loadPackages();
      this.loadPendingUpgradeRequest();
    }
  }

  changeLanguage(): void {
    this.languageService.setLanguage(this.currentLanguage);
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
        // Initialize billing interval selection to monthly for all packages
        this.packages.forEach(pkg => {
          if (!this.selectedBillingInterval[pkg.name]) {
            this.selectedBillingInterval[pkg.name] = 'monthly';
          }
        });
      },
      error: (err) => {
        console.error('Error loading packages:', err);
        // Bei 401-Fehler wird der Interceptor den Benutzer ausloggen
      }
    });
  }

  selectBillingInterval(packageName: string, interval: 'monthly' | 'yearly'): void {
    this.selectedBillingInterval[packageName] = interval;
  }

  getUsagePercentage(type: 'contracts' | 'customers' | 'meters'): number {
    if (!this.userLimits) return 0;

    const usage = this.userLimits.usage[type];
    const limit = this.userLimits.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof this.userLimits.limits];

    if (limit === -1) return 0;
    return Math.min(100, (usage / (limit as number)) * 100);
  }

  isFileUploadEnabled(pkg: Package): boolean {
    const fileUploadFeature = pkg.features?.find(f => f.name === 'file_upload');
    return fileUploadFeature ? fileUploadFeature.enabled : false;
  }

  changePackage(packageName: string, packageOrder: number): void {
    console.log('🔵 [Settings] changePackage called:', { packageName, packageOrder });
    const isDowngrade = this.userLimits && packageOrder < this.userLimits.package.order;
    const isUpgrade = this.userLimits && packageOrder > this.userLimits.package.order;
    const action = isDowngrade ? 'Downgrade' : 'Upgrade';
    const billingInterval = this.selectedBillingInterval[packageName] || 'monthly';
    console.log('🔵 [Settings] Action type:', { isDowngrade, isUpgrade, action, billingInterval });

    const targetPackage = this.packages.find(p => p.name === packageName);
    if (!targetPackage) {
      console.error('❌ [Settings] Target package not found:', packageName);
      return;
    }
    console.log('🔵 [Settings] Target package:', targetPackage);

    const price = billingInterval === 'yearly' ? targetPackage.yearlyPrice : targetPackage.monthlyPrice;
    const intervalText = billingInterval === 'yearly' ? 'jährlich' : 'monatlich';
    const savingsText = billingInterval === 'yearly' && targetPackage.yearlySavings
      ? `\n\nSie sparen ${targetPackage.yearlySavings} ${targetPackage.currency} bei jährlicher Zahlung!`
      : '';

    let confirmMessage = `Möchten Sie wirklich auf das ${targetPackage.displayName}-Paket ${action.toLowerCase()}?\n\nZahlungsintervall: ${intervalText}\nPreis: ${price} ${targetPackage.currency}${savingsText}\n\nSie werden zu PayPal weitergeleitet, um die Zahlung abzuschließen.`;

    if (isDowngrade) {
      confirmMessage = `ACHTUNG: Downgrade auf ${targetPackage.displayName}\n\nWenn Ihre aktuelle Nutzung die Limits des neuen Pakets überschreitet, wird der Downgrade abgelehnt.\n\nZahlungsintervall: ${intervalText}\nPreis: ${price} ${targetPackage.currency}\n\nMöchten Sie fortfahren?`;
    }

    if (confirm(confirmMessage)) {
      console.log('🟢 [Settings] User confirmed the action');
      // For downgrades and free packages, use the old method (no payment needed)
      if (isDowngrade || targetPackage.isFree) {
        console.log('🔵 [Settings] Using direct upgrade (downgrade or free package)');
        this.packageService.upgradePackage(packageName, billingInterval).subscribe({
          next: (response: any) => {
            if (response.success) {
              alert(`${action} erfolgreich!\n\nNeues Paket: ${response.subscription.package}\nZahlungsintervall: ${response.subscription.billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich'}\nPreis: ${response.subscription.price} ${targetPackage.currency}\n\n${response.message}`);
              // Aktualisiere User-Daten im AuthService (inkl. packageFeatures)
              if (response.data) {
                this.authService.updateCurrentUser(response.data);
              }
              this.loadUserLimits();
              this.loadPackages();
            }
          },
          error: (error: any) => {
            console.error('Error changing package:', error);
            const errorMessage = error.error?.message || 'Unbekannter Fehler';
            alert('Fehler beim Paket-Wechsel: ' + errorMessage);
          }
        });
      } else {
        // For upgrades and paid packages, redirect to PayPal
        console.log('🟡 [Settings] Using PayPal for upgrade (paid package)');
        this.purchaseWithPayPal(packageName, billingInterval);
      }
    } else {
      console.log('🔴 [Settings] User cancelled the action');
    }
  }

  purchaseWithPayPal(packageName: string, billingInterval: 'monthly' | 'yearly'): void {
    console.log('🟡 [Settings] purchaseWithPayPal called:', { packageName, billingInterval });
    this.paypalService.createOrder(packageName, billingInterval).subscribe({
      next: (response) => {
        console.log('✅ [Settings] PayPal createOrder response:', response);
        if (response.success && response.approvalUrl) {
          // Store order ID in sessionStorage for later capture
          sessionStorage.setItem('paypalOrderId', response.orderId);
          sessionStorage.setItem('paypalPackageName', packageName);
          sessionStorage.setItem('paypalBillingInterval', billingInterval);
          console.log('🟢 [Settings] Redirecting to PayPal:', response.approvalUrl);

          // Redirect to PayPal
          window.location.href = response.approvalUrl;
        } else {
          console.error('❌ [Settings] Invalid PayPal response:', response);
          alert('Fehler beim Erstellen der PayPal-Bestellung');
        }
      },
      error: (error) => {
        console.error('❌ [Settings] Error creating PayPal order:', error);
        alert('Fehler beim Erstellen der PayPal-Bestellung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
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

  changePassword(): void {
    // Validation
    if (this.newPassword.length < 8) {
      alert('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        if (response.success) {
          alert('Passwort erfolgreich geändert!');
          // Reset form
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        }
      },
      error: (error) => {
        this.isChangingPassword = false;
        const errorMessage = error.error?.message || 'Fehler beim Ändern des Passworts';
        alert(errorMessage);
      }
    });
  }
}

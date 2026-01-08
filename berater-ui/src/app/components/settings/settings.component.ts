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
        [profileFirstName]="profileFirstName"
        [profileLastName]="profileLastName"
        [isSavingProfile]="isSavingProfile"
        [currentUserEmail]="currentUser?.email || ''"
        [currentLanguage]="currentLanguage"
        (saveSettingsEvent)="saveSettings()"
        (resetToDefaultsEvent)="resetToDefaults()"
        (changePackageEvent)="changePackage($event.packageName, $event.order)"
        (selectBillingIntervalEvent)="selectBillingInterval($any($event).packageName, $any($event).interval)"
        (changePasswordEvent)="changePassword()"
        (currentPasswordChange)="currentPassword = $any($event)"
        (newPasswordChange)="newPassword = $any($event)"
        (confirmPasswordChange)="confirmPassword = $any($event)"
        (saveProfileEvent)="saveProfile()"
        (profileFirstNameChange)="profileFirstName = $event"
        (profileLastNameChange)="profileLastName = $event"
        (languageChange)="currentLanguage = $event; changeLanguage()"
      ></app-settings-mobile>
    } @else {
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'SETTINGS.TITLE' | translate }}</h1>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-container">
        <button class="tab-btn" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
          <i class="fas fa-user"></i>
          <span>{{ 'SETTINGS.TABS.PROFILE' | translate }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
          <i class="fas fa-bell"></i>
          <span>{{ 'SETTINGS.TABS.NOTIFICATIONS' | translate }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'appearance'" (click)="activeTab = 'appearance'">
          <i class="fas fa-palette"></i>
          <span>{{ 'SETTINGS.TABS.APPEARANCE' | translate }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'package'" (click)="activeTab = 'package'">
          <i class="fas fa-box"></i>
          <span>{{ 'SETTINGS.TABS.PACKAGE' | translate }}</span>
        </button>
      </div>

      <div class="settings-content">
        <!-- PROFIL TAB -->
        @if(activeTab === 'profile') {
        <!-- Profil -->
        <div class="settings-section">
          <h2>👤 {{ 'SETTINGS.PROFILE.TITLE' | translate }}</h2>
          <p class="section-description">
            {{ 'SETTINGS.PROFILE.DESCRIPTION' | translate }}
          </p>

          <div class="setting-group">
            <div class="input-group">
              <label>{{ 'AUTH.FIRST_NAME' | translate }} *</label>
              <input
                type="text"
                [(ngModel)]="profileFirstName"
                [placeholder]="'AUTH.FIRST_NAME' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group">
              <label>{{ 'AUTH.LAST_NAME' | translate }} *</label>
              <input
                type="text"
                [(ngModel)]="profileLastName"
                [placeholder]="'AUTH.LAST_NAME' | translate"
                class="input-field"
              />
            </div>

            <div class="input-group" *ngIf="currentUser?.email">
              <label>{{ 'AUTH.EMAIL' | translate }}</label>
              <input
                type="email"
                [value]="currentUser?.email"
                class="input-field"
                disabled
              />
              <small class="hint">{{ 'SETTINGS.PROFILE.EMAIL_HINT' | translate }}</small>
            </div>

            <button
              class="btn-primary"
              (click)="saveProfile()"
              [disabled]="isSavingProfile || !profileFirstName || !profileLastName">
              <i class="fas" [class.fa-spinner]="isSavingProfile" [class.fa-spin]="isSavingProfile" [class.fa-save]="!isSavingProfile"></i>
              {{ isSavingProfile ? ('COMMON.SAVING' | translate) : ('SETTINGS.PROFILE.SAVE' | translate) }}
            </button>
          </div>
        </div>

        <!-- Passwort ändern (im Profil Tab) -->
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
        }

        <!-- BENACHRICHTIGUNGEN TAB -->
        @if(activeTab === 'notifications') {
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

            <div class="checkbox-wrapper">
              <input
                type="checkbox"
                [(ngModel)]="settings.reminderDays.sendEmail"
                (change)="saveSettings()"
                class="checkbox-input"
                id="sendEmailDesktop"
              />
              <label for="sendEmailDesktop" class="checkbox-label">📧 {{ 'SETTINGS.REMINDERS.EMAIL_NOTIFY' | translate }}</label>
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
            <div class="checkbox-wrapper">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.email"
                (change)="saveSettings()"
                class="checkbox-input"
                id="notifyEmailDesktop"
              />
              <label for="notifyEmailDesktop" class="checkbox-label">{{ 'SETTINGS.NOTIFICATIONS.EMAIL' | translate }}</label>
            </div>

            <div class="checkbox-wrapper" style="margin-top: 0.75rem;">
              <input
                type="checkbox"
                [(ngModel)]="settings.notifications.browser"
                (change)="saveSettings()"
                class="checkbox-input"
                id="notifyBrowserDesktop"
              />
              <label for="notifyBrowserDesktop" class="checkbox-label">{{ 'SETTINGS.NOTIFICATIONS.BROWSER' | translate }}</label>
            </div>
          </div>
        </div>
        }

        <!-- DARSTELLUNG TAB -->
        @if(activeTab === 'appearance') {
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
        }

        <!-- PAKET TAB -->
        @if(activeTab === 'package') {
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

              <!-- Subscription Info: Ablaufdatum -->
              <div *ngIf="subscriptionInfo?.subscription?.endDate && subscriptionInfo?.package?.name !== 'free'" class="subscription-info">
                <div class="subscription-item">
                  <div class="subscription-label">📅 {{ 'SETTINGS.PACKAGE.BILLING_INTERVAL' | translate }}:</div>
                  <div class="subscription-value">{{ subscriptionInfo.subscription.billingIntervalText }}</div>
                </div>
                <div class="subscription-item">
                  <div class="subscription-label">⏰ {{ 'SETTINGS.PACKAGE.EXPIRES_ON' | translate }}:</div>
                  <div class="subscription-value" [class.expiring-soon]="isExpiringSoon()">
                    {{ formatSubscriptionDate(subscriptionInfo.subscription.endDate) }}
                    <span *ngIf="getDaysUntilExpiry() <= 30 && getDaysUntilExpiry() > 0" class="expiry-warning">
                      ({{ getDaysUntilExpiry() }} {{ 'SETTINGS.PACKAGE.DAYS_LEFT' | translate }})
                    </span>
                    <span *ngIf="getDaysUntilExpiry() <= 0" class="expiry-danger">
                      ({{ 'SETTINGS.PACKAGE.EXPIRED' | translate }})
                    </span>
                  </div>
                </div>

                <!-- Verlängerungsbutton -->
                <div class="subscription-actions">
                  <button class="renew-btn" (click)="openRenewModal()">
                    🔄 {{ 'SETTINGS.PACKAGE.RENEW_PACKAGE' | translate }}
                  </button>
                </div>
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
        }

        <div class="save-indicator" *ngIf="showSaveIndicator">
          ✓ {{ 'SETTINGS.ACTIONS.SAVED' | translate }}
        </div>
      </div>
    </div>

    <!-- Renew Modal -->
    <div class="modal-overlay" *ngIf="showRenewModal" (click)="closeRenewModal()">
      <div class="renew-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🔄 {{ 'SETTINGS.PACKAGE.RENEW_PACKAGE' | translate }}</h3>
          <button class="close-btn" (click)="closeRenewModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="current-package-info">
            <div class="package-name">{{ subscriptionInfo?.package?.displayName }}</div>
            <div class="current-expiry">
              {{ 'SETTINGS.PACKAGE.CURRENT_EXPIRY' | translate }}:
              <strong>{{ formatSubscriptionDate(subscriptionInfo?.subscription?.endDate) }}</strong>
            </div>
          </div>

          <div class="billing-interval-selection">
            <label>{{ 'SETTINGS.PACKAGE.BILLING_INTERVAL' | translate }}:</label>
            <div class="interval-buttons">
              <button
                class="interval-btn"
                [class.active]="renewBillingInterval === 'monthly'"
                (click)="renewBillingInterval = 'monthly'">
                {{ 'SETTINGS.PACKAGE.MONTHLY' | translate }}
              </button>
              <button
                class="interval-btn"
                [class.active]="renewBillingInterval === 'yearly'"
                (click)="renewBillingInterval = 'yearly'">
                {{ 'SETTINGS.PACKAGE.YEARLY' | translate }}
                <span class="savings-badge" *ngIf="getRenewSavings() > 0">-{{ getRenewSavings() }}€</span>
              </button>
            </div>
          </div>

          <div class="renewal-summary">
            <div class="summary-row">
              <span>{{ 'SETTINGS.PACKAGE.NEW_EXPIRY' | translate }}:</span>
              <strong>{{ getNewEndDate() }}</strong>
            </div>
            <div class="summary-row price">
              <span>{{ 'SETTINGS.PACKAGE.PRICE' | translate }}:</span>
              <strong>{{ getRenewPrice() }} €</strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="closeRenewModal()">
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button class="confirm-btn" (click)="confirmRenewal()" [disabled]="isRenewing">
            <span *ngIf="!isRenewing">{{ 'SETTINGS.PACKAGE.CONFIRM_RENEWAL' | translate }}</span>
            <span *ngIf="isRenewing">{{ 'COMMON.LOADING' | translate }}...</span>
          </button>
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
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }

    /* Tab Navigation */
    .tabs-container {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 12px;
      overflow-x: auto;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.7);
      color: #333;
    }

    .tab-btn.active {
      background: white;
      color: #34d399;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-btn i {
      font-size: 1rem;
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

    /* Subscription Info Styles */
    .subscription-info {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .subscription-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .subscription-label {
      font-weight: 600;
      color: #555;
      font-size: 0.95rem;
    }

    .subscription-value {
      color: #333;
      font-size: 0.95rem;
    }

    .subscription-value.expiring-soon {
      color: #f59e0b;
      font-weight: 600;
    }

    .expiry-warning {
      color: #f59e0b;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .expiry-danger {
      color: #ef4444;
      font-weight: 700;
      margin-left: 0.5rem;
    }

    .subscription-actions {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .renew-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .renew-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Renew Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .renew-modal {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .renew-modal .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .renew-modal .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .renew-modal .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .renew-modal .modal-body {
      padding: 1.5rem;
    }

    .current-package-info {
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .current-package-info .package-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .current-package-info .current-expiry {
      color: #666;
      font-size: 0.95rem;
    }

    .billing-interval-selection {
      margin-bottom: 1.5rem;
    }

    .billing-interval-selection label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #333;
    }

    .interval-buttons {
      display: flex;
      gap: 1rem;
    }

    .interval-btn {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }

    .interval-btn:hover {
      border-color: #667eea;
    }

    .interval-btn.active {
      border-color: #667eea;
      background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 100%);
      color: #667eea;
      font-weight: 600;
    }

    .savings-badge {
      display: inline-block;
      background: #34d399;
      color: white;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-left: 0.5rem;
      font-weight: 600;
    }

    .renewal-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.price {
      border-top: 1px solid #e0e0e0;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-size: 1.1rem;
    }

    .summary-row.price strong {
      color: #667eea;
      font-size: 1.25rem;
    }

    .renew-modal .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8f9fa;
      justify-content: flex-end;
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: #f0f0f0;
    }

    .confirm-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .confirm-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .confirm-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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
  subscriptionInfo: any = null;
  selectedBillingInterval: { [packageName: string]: 'monthly' | 'yearly' } = {};

  // Tab navigation
  activeTab: 'profile' | 'notifications' | 'appearance' | 'package' = 'profile';

  // Password change properties
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;

  // Profile properties
  profileFirstName = '';
  profileLastName = '';
  isSavingProfile = false;

  // Language
  currentLanguage: Language = 'de';

  currentUser: any = null;

  // Renew Modal
  showRenewModal = false;
  renewBillingInterval: 'monthly' | 'yearly' = 'monthly';
  isRenewing = false;

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
      if (user) {
        this.profileFirstName = user.firstName || '';
        this.profileLastName = user.lastName || '';
      }
    });

    // Nur Limits und Pakete laden, wenn der Benutzer eingeloggt ist
    if (this.authService.isAuthenticated()) {
      this.loadUserLimits();
      this.loadPackages();
      this.loadPendingUpgradeRequest();
      this.loadSubscriptionInfo();
    }
  }

  loadSubscriptionInfo(): void {
    this.packageService.getSubscriptionInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.subscriptionInfo = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading subscription info:', err);
      }
    });
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

  formatSubscriptionDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getDaysUntilExpiry(): number {
    if (!this.subscriptionInfo?.subscription?.endDate) {
      return -1;
    }
    const endDate = new Date(this.subscriptionInfo.subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isExpiringSoon(): boolean {
    const daysLeft = this.getDaysUntilExpiry();
    return daysLeft >= 0 && daysLeft <= 30;
  }

  openRenewModal(): void {
    // Setze das aktuelle Billing-Interval als Standard
    this.renewBillingInterval = this.subscriptionInfo?.subscription?.billingInterval || 'monthly';
    this.showRenewModal = true;
  }

  closeRenewModal(): void {
    this.showRenewModal = false;
  }

  getRenewPrice(): number {
    if (!this.subscriptionInfo?.package) return 0;
    // Verwende die Preise direkt aus subscriptionInfo.package
    const monthlyPrice = this.subscriptionInfo.package.monthlyPrice || 0;
    const yearlyPrice = this.subscriptionInfo.package.yearlyPrice || 0;
    return this.renewBillingInterval === 'yearly' ? yearlyPrice : monthlyPrice;
  }

  getRenewSavings(): number {
    if (!this.subscriptionInfo?.package) return 0;
    // Berechne die Ersparnis: 12 * monatlich - jährlich
    const monthlyPrice = this.subscriptionInfo.package.monthlyPrice || 0;
    const yearlyPrice = this.subscriptionInfo.package.yearlyPrice || 0;
    if (this.renewBillingInterval === 'yearly' && monthlyPrice > 0) {
      const savings = (monthlyPrice * 12) - yearlyPrice;
      // Runde auf 2 Dezimalstellen und stelle sicher, dass der Wert positiv ist
      return Math.max(0, Math.round(savings * 100) / 100);
    }
    return 0;
  }

  getNewEndDate(): string {
    if (!this.subscriptionInfo?.subscription?.endDate) return '';
    const currentEndDate = new Date(this.subscriptionInfo.subscription.endDate);
    const now = new Date();

    // Wenn noch nicht abgelaufen, ab Ablaufdatum verlängern
    const startDate = currentEndDate > now ? currentEndDate : now;
    const newEndDate = new Date(startDate);

    if (this.renewBillingInterval === 'yearly') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }

    return newEndDate.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  confirmRenewal(): void {
    if (!this.subscriptionInfo?.package?.name || this.isRenewing) return;

    const packageName = this.subscriptionInfo.package.name;
    const price = this.getRenewPrice();

    // Schließe das Modal
    this.showRenewModal = false;

    // Wenn Preis > 0, zur PayPal-Zahlung weiterleiten
    if (price > 0) {
      this.purchaseWithPayPal(packageName, this.renewBillingInterval);
    } else {
      // Kostenloses Paket oder Preis 0 - direkt verlängern (sollte normalerweise nicht vorkommen)
      this.isRenewing = true;
      this.packageService.purchasePackage(packageName, this.renewBillingInterval).subscribe({
        next: (response) => {
          this.isRenewing = false;
          if (response.success) {
            alert(response.message || 'Paket erfolgreich verlängert!');
            this.loadSubscriptionInfo();
            this.loadUserLimits();
          }
        },
        error: (err) => {
          this.isRenewing = false;
          console.error('Error renewing package:', err);
          alert(err.error?.message || 'Fehler bei der Paketverlängerung');
        }
      });
    }
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

  saveProfile(): void {
    if (!this.profileFirstName.trim() || !this.profileLastName.trim()) {
      alert('Bitte geben Sie Vor- und Nachname ein.');
      return;
    }

    this.isSavingProfile = true;

    this.authService.updateProfile({
      firstName: this.profileFirstName.trim(),
      lastName: this.profileLastName.trim()
    }).subscribe({
      next: (response) => {
        this.isSavingProfile = false;
        if (response.success) {
          this.showSaveIndicator = true;
          setTimeout(() => {
            this.showSaveIndicator = false;
          }, 2000);
        }
      },
      error: (error) => {
        this.isSavingProfile = false;
        const errorMessage = error.error?.message || 'Fehler beim Speichern des Profils';
        alert(errorMessage);
      }
    });
  }
}

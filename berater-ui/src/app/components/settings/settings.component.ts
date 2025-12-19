import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
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
  `]
})
export class SettingsComponent implements OnInit {
  settings!: UserSettings;
  showSaveIndicator = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();
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

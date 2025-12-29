import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AppUser, UserStats } from '../../services/admin.service';
import { TableContainerComponent } from "../shared/tablecontainer.component";
import { ViewportService } from '../../services/viewport.service';
import { AdminMobileComponent } from './mobile/admin-mobile.component';

@Component({
    selector: 'app-admin',
    imports: [CommonModule, FormsModule, TableContainerComponent, AdminMobileComponent],
    template: `
    @if (isMobile) {
      <app-admin-mobile
        [users]="users"
        [stats]="stats"
        [activeActionMenu]="activeMenuId"
        (createUser)="showCreateModal()"
        (editUser)="editUser($event)"
        (deleteUser)="deleteUser($event)"
        (blockUser)="showBlockModalById($event)"
        (unblockUser)="unblockUser($event)"
        (toggleActionMenu)="toggleActionMenuMobile($event)"
        (closeActionMenu)="closeActionMenu()"
        (filterRoleChange)="onFilterRoleChange($event)"
        (filterPackageChange)="onFilterPackageChange($event)"
        (filterBlockedChange)="onFilterBlockedChange($event)"
      ></app-admin-mobile>
    } @else {
    <div class="page-container" (click)="closeActionMenu()">
      <div class="page-header">
        <h1>Superadmin Dashboard</h1>
        <button class="btn-primary" (click)="showCreateModal()">+ Neuer Benutzer</button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-details">
            <div class="stat-label">Gesamt</div>
            <div class="stat-value">{{ stats.total }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-details">
            <div class="stat-label">Aktiv</div>
            <div class="stat-value">{{ stats.active }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚫</div>
          <div class="stat-details">
            <div class="stat-label">Blockiert</div>
            <div class="stat-value">{{ stats.blocked }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💤</div>
          <div class="stat-details">
            <div class="stat-label">Inaktiv</div>
            <div class="stat-value">{{ stats.inactive }}</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="filterRole" (ngModelChange)="loadUsers()" class="filter-select">
          <option value="">Alle Rollen</option>
          <option value="berater">Berater</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <select [(ngModel)]="filterPackage" (ngModelChange)="loadUsers()" class="filter-select">
          <option value="">Alle Pakete</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select [(ngModel)]="filterBlocked" (ngModelChange)="loadUsers()" class="filter-select">
          <option [ngValue]="undefined">Alle Status</option>
          <option [ngValue]="false">Aktiv</option>
          <option [ngValue]="true">Blockiert</option>
        </select>
      </div>

      <!-- Users Table -->
      <app-table-container>
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Paket</th>
              <th>Status</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" [class.blocked-row]="user.isBlocked">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge badge-role" [class.badge-superadmin]="user.role === 'superadmin'">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span class="badge badge-package" [class.badge-enterprise]="user.package === 'enterprise'">
                  {{ getPackageLabel(user.package) }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-blocked]="user.isBlocked" [class.badge-active]="!user.isBlocked && user.isActive">
                  {{ user.isBlocked ? 'Blockiert' : (user.isActive ? 'Aktiv' : 'Inaktiv') }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'dd.MM.yyyy' }}</td>
              <td class="actions-cell">
                <div class="action-menu-container">
                  <button class="action-menu-btn" (click)="toggleActionMenu(user._id, $event, user.isBlocked); $event.stopPropagation()">
                    ⋮
                  </button>
                  <div class="action-menu" [class.action-menu-up]="menuOpenUpwards" *ngIf="activeMenuId === user._id" (click)="$event.stopPropagation()">
                    <button class="menu-item" (click)="editUser(user); closeActionMenu()">
                      ✏️ Bearbeiten
                    </button>
                    <button class="menu-item" (click)="showResetPasswordModal(user); closeActionMenu()">
                      🔑 Passwort zurücksetzen
                    </button>
                    <button
                      *ngIf="!user.isBlocked"
                      class="menu-item menu-item-warning"
                      (click)="showBlockModal(user); closeActionMenu()"
                    >
                      🚫 Blockieren
                    </button>
                    <button
                      *ngIf="user.isBlocked"
                      class="menu-item"
                      (click)="unblockUser(user._id); closeActionMenu()"
                    >
                      ✅ Entsperren
                    </button>
                    <button
                      class="menu-item menu-item-danger"
                      (click)="deleteUser(user._id); closeActionMenu()"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </app-table-container>

      <!-- Create/Edit User Modal -->
      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editMode ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}</h2>
          <form (ngSubmit)="saveUser()">
            <div class="form-row">
              <div class="form-group">
                <label>Vorname*</label>
                <input type="text" [(ngModel)]="currentUser.firstName" name="firstName" required />
              </div>
              <div class="form-group">
                <label>Nachname*</label>
                <input type="text" [(ngModel)]="currentUser.lastName" name="lastName" required />
              </div>
            </div>

            <div class="form-group">
              <label>E-Mail*</label>
              <input type="email" [(ngModel)]="currentUser.email" name="email" required />
            </div>

            <div class="form-group" *ngIf="!editMode">
              <label>Passwort*</label>
              <input type="password" [(ngModel)]="currentUser.password" name="password" required minlength="8" />
              <small>Mindestens 8 Zeichen</small>
            </div>

            <div class="form-group">
              <label>Telefon</label>
              <input type="tel" [(ngModel)]="currentUser.phone" name="phone" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Rolle*</label>
                <select [(ngModel)]="currentUser.role" name="role" required>
                  <option value="berater">Berater</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div class="form-group">
                <label>Paket*</label>
                <select [(ngModel)]="currentUser.package" name="package" required>
                  <option value="basic">Basic (50 Kunden, 100 Verträge)</option>
                  <option value="professional">Professional (200 Kunden, 500 Verträge)</option>
                  <option value="enterprise">Enterprise (Unbegrenzt)</option>
                </select>
              </div>
            </div>

            <div class="form-group" *ngIf="editMode">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="currentUser.isActive" name="isActive" />
                <span>Aktiv</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Abbrechen</button>
              <button type="submit" class="btn-primary">Speichern</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Block User Modal -->
      <div class="modal" *ngIf="showBlockUserModal" (click)="closeBlockModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Benutzer blockieren</h2>
          <p>Möchten Sie <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong> wirklich blockieren?</p>
          <div class="form-group">
            <label>Grund*</label>
            <textarea
              [(ngModel)]="blockReason"
              name="blockReason"
              rows="3"
              placeholder="Grund für die Blockierung..."
              required
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closeBlockModal()">Abbrechen</button>
            <button type="button" class="btn-danger" (click)="confirmBlockUser()">Blockieren</button>
          </div>
        </div>
      </div>

      <!-- Reset Password Modal -->
      <div class="modal" *ngIf="showPasswordModal" (click)="closePasswordModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Passwort zurücksetzen</h2>
          <p>Neues Passwort für <strong>{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong></p>
          <div class="form-group">
            <label>Neues Passwort*</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              minlength="8"
              placeholder="Mindestens 8 Zeichen"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closePasswordModal()">Abbrechen</button>
            <button type="button" class="btn-primary" (click)="confirmResetPassword()">Zurücksetzen</button>
          </div>
        </div>
      </div>
    </div>
    }
  `,
    styles: [`
    .page-container { padding: 2rem; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; color: #333; margin: 0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      font-size: 2.5rem;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .filter-select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #555;
    }
    .data-table td { padding: 1rem; border-top: 1px solid #eee; }

    .blocked-row {
      background-color: #fff3f3;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: #e0e0e0;
      color: #333;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-blocked { background: #ffebee; color: #c62828; }
    .badge-role { background: #e3f2fd; color: #1976d2; }
    .badge-superadmin { background: #f3e5f5; color: #7b1fa2; }
    .badge-package { background: #fff3e0; color: #f57c00; }
    .badge-enterprise { background: #e8eaf6; color: #3f51b5; }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary {
      background: #e0e0e0;
      color: #555;
    }
    .btn-danger {
      background: #ef5350;
      color: white;
    }
    .btn-danger:hover { background: #e53935; }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-content h2 { margin-top: 0; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group small {
      color: #666;
      font-size: 0.875rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .actions-cell {
      position: relative;
      width: 60px;
    }
    .action-menu-container {
      position: relative;
      display: inline-block;
    }
    .action-menu-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      color: #666;
      line-height: 1;
      transition: all 0.2s;
      border-radius: 4px;
    }
    .action-menu-btn:hover {
      background: #f0f0f0;
      color: #333;
    }
    .action-menu {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      z-index: 100;
      margin-top: 0.25rem;
      overflow: hidden;
    }
    .action-menu-up {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 0.25rem;
    }
    .menu-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
      color: #333;
    }
    .menu-item:hover {
      background: #f5f5f5;
    }
    .menu-item-danger {
      color: #c62828;
    }
    .menu-item-danger:hover {
      background: #ffebee;
    }
    .menu-item-warning {
      color: #f57c00;
    }
    .menu-item-warning:hover {
      background: #fff3e0;
    }
  `]
})
export class AdminComponent implements OnInit {
  users: AppUser[] = [];
  stats: UserStats | null = null;
  filterRole = '';
  filterPackage = '';
  filterBlocked?: boolean = undefined;
  showModal = false;
  editMode = false;
  currentUser: Partial<AppUser> & { password?: string } = {};
  activeMenuId: string | null = null;
  menuOpenUpwards = false;
  showBlockUserModal = false;
  showPasswordModal = false;
  selectedUser: AppUser | null = null;
  blockReason = '';
  newPassword = '';

  get isMobile() {
    return this.viewport.isMobile();
  }

  constructor(
    private adminService: AdminService,
    private viewport: ViewportService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.adminService.getUsers({
      role: this.filterRole || undefined,
      package: this.filterPackage || undefined,
      isBlocked: this.filterBlocked
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Benutzer:', error);
        alert('Benutzer konnten nicht geladen werden');
      }
    });
  }

  loadStats(): void {
    this.adminService.getUserStats().subscribe({
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

  showCreateModal(): void {
    this.editMode = false;
    this.currentUser = {
      role: 'berater',
      package: 'basic',
      isActive: true
    };
    this.showModal = true;
  }

  editUser(user: AppUser): void {
    this.editMode = true;
    this.currentUser = { ...user };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = {};
  }

  saveUser(): void {
    if (this.editMode && this.currentUser._id) {
      this.adminService.updateUser(this.currentUser._id, this.currentUser).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
          this.closeModal();
        },
        error: (error) => {
          alert('Fehler beim Aktualisieren des Benutzers: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      if (!this.currentUser.password) {
        alert('Passwort ist erforderlich');
        return;
      }
      this.adminService.createUser(this.currentUser as any).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
          this.closeModal();
        },
        error: (error) => {
          alert('Fehler beim Erstellen des Benutzers: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  showBlockModal(user: AppUser): void {
    this.selectedUser = user;
    this.blockReason = '';
    this.showBlockUserModal = true;
  }

  closeBlockModal(): void {
    this.showBlockUserModal = false;
    this.selectedUser = null;
    this.blockReason = '';
  }

  confirmBlockUser(): void {
    if (!this.blockReason) {
      alert('Bitte geben Sie einen Grund an');
      return;
    }
    if (this.selectedUser) {
      this.adminService.blockUser(this.selectedUser._id, this.blockReason).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
          this.closeBlockModal();
        },
        error: (error) => {
          alert('Fehler beim Blockieren: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  unblockUser(id: string): void {
    if (confirm('Benutzer wirklich entsperren?')) {
      this.adminService.unblockUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
        },
        error: (error) => {
          alert('Fehler beim Entsperren: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  showResetPasswordModal(user: AppUser): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.selectedUser = null;
    this.newPassword = '';
  }

  confirmResetPassword(): void {
    if (!this.newPassword || this.newPassword.length < 8) {
      alert('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    if (this.selectedUser) {
      this.adminService.resetPassword(this.selectedUser._id, this.newPassword).subscribe({
        next: () => {
          alert('Passwort erfolgreich zurückgesetzt');
          this.closePasswordModal();
        },
        error: (error) => {
          alert('Fehler beim Zurücksetzen: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
        },
        error: (error) => {
          alert('Fehler beim Löschen: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  toggleActionMenu(id: string, event: MouseEvent, isBlocked: boolean = false): void {
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
      this.menuOpenUpwards = false;
      return;
    }

    this.activeMenuId = id;

    // Intelligente Positionierung: Prüfe verfügbaren Platz oben und unten
    const button = event.target as HTMLElement;
    const rect = button.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Geschätzte Menühöhe (5 Menüeinträge * ~44px pro Eintrag)
    const menuHeight = 220;

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Öffne nach oben, wenn unten nicht genug Platz ist UND oben mehr Platz ist
    this.menuOpenUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
    this.menuOpenUpwards = false;
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      berater: 'Berater',
      admin: 'Admin',
      superadmin: 'Superadmin'
    };
    return labels[role] || role;
  }

  getPackageLabel(pkg: string): string {
    const labels: any = {
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return labels[pkg] || pkg;
  }

  // Mobile-specific methods
  showBlockModalById(userId: string): void {
    const user = this.users.find(u => u._id === userId);
    if (user) {
      this.showBlockModal(user);
    }
  }

  onFilterRoleChange(role: string): void {
    this.filterRole = role;
    this.loadUsers();
  }

  onFilterPackageChange(pkg: string): void {
    this.filterPackage = pkg;
    this.loadUsers();
  }

  onFilterBlockedChange(blocked: boolean | undefined): void {
    this.filterBlocked = blocked;
    this.loadUsers();
  }

  toggleActionMenuMobile(id: string): void {
    if (this.activeMenuId === id) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = id;
    }
  }
}

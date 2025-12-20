import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SettingsService, UserSettings } from '../../services/settings.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="app-layout">
      <!-- Navigation -->
      <nav class="sidebar" [style.background]="sidebarColor">
        <div class="logo">
          <span class="logo-icon">🏢</span>
          <h2 class="logo-text">Berater App</h2>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="icon">📊</span>
              <span class="nav-text">{{ settings.sidebarLabels.dashboard }}</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role !== 'superadmin'">
            <a routerLink="/customers" routerLinkActive="active">
              <span class="icon">👥</span>
              <span class="nav-text">{{ settings.sidebarLabels.customers }}</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role !== 'superadmin'">
            <a routerLink="/meters" routerLinkActive="active">
              <span class="icon">⚡</span>
              <span class="nav-text">{{ settings.sidebarLabels.meters }}</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role !== 'superadmin'">
            <a routerLink="/contracts" routerLinkActive="active">
              <span class="icon">📋</span>
              <span class="nav-text">{{ settings.sidebarLabels.contracts }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/todos" routerLinkActive="active">
              <span class="icon">✓</span>
              <span class="nav-text">{{ settings.sidebarLabels.todos }}</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role !== 'superadmin'">
            <a routerLink="/suppliers" routerLinkActive="active">
              <span class="icon">🏭</span>
              <span class="nav-text">{{ settings.sidebarLabels.suppliers || 'Anbieter' }}</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role === 'superadmin'">
            <a routerLink="/admin" routerLinkActive="active">
              <span class="icon">👑</span>
              <span class="nav-text">Benutzer</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role === 'superadmin'">
            <a routerLink="/packages" routerLinkActive="active">
              <span class="icon">📦</span>
              <span class="nav-text">Pakete</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role !== 'superadmin'">
            <a routerLink="/settings" routerLinkActive="active">
              <span class="icon">⚙️</span>
              <span class="nav-text">Einstellungen</span>
            </a>
          </li>
        </ul>

        <div class="user-section">
          <div class="user-info" *ngIf="currentUser">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
              <div class="user-role">{{ currentUser.role }}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="icon">🚪</span>
            <span class="nav-text">Abmelden</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .sidebar {
      width: 70px;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      transition: width 0.3s ease;
      overflow: hidden;
      z-index: 1000;
    }

    .sidebar:hover {
      width: 260px;
    }

    .logo {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      white-space: nowrap;
    }

    .logo-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .logo-text {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sidebar:hover .logo-text {
      opacity: 1;
    }

    .nav-menu {
      flex: 1;
      list-style: none;
      padding: 0.5rem 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }

    .nav-menu li {
      margin: 0;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .nav-menu a:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-menu a.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-left: 3px solid white;
    }

    .nav-menu .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      width: 1.25rem;
      text-align: center;
    }

    .nav-text {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sidebar:hover .nav-text {
      opacity: 1;
    }

    .user-section {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      white-space: nowrap;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sidebar:hover .user-details {
      opacity: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      text-transform: capitalize;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .logout-btn .icon {
      flex-shrink: 0;
    }

    .main-content {
      flex: 1;
      margin-left: 70px;
      padding: 0;
      overflow-y: auto;
      transition: margin-left 0.3s ease;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: any = null;
  settings!: UserSettings;
  sidebarColor: string = '';

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();
    this.sidebarColor = this.settingsService.getSidebarColor();

    // Subscribe to settings changes
    this.settingsService.settings$.subscribe(settings => {
      this.settings = settings;
      this.sidebarColor = this.settingsService.getSidebarColor();
    });
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SettingsService, UserSettings } from '../../services/settings.service';

@Component({
    selector: 'app-layout',
    imports: [CommonModule, RouterLink, RouterOutlet, RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser: any = null;
  settings!: UserSettings;
  sidebarColor: string = '';
  sidebarOpen = false;

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

    // Apply initial theme colors
    this.settingsService.applyThemeColors();

    // Subscribe to settings changes
    this.settingsService.settings$.subscribe(settings => {
      this.settings = settings;
      this.sidebarColor = this.settingsService.getSidebarColor();

      // Apply theme colors when settings change
      this.settingsService.applyThemeColors();
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { TodoService } from '../../services/todo.service';
import { EducationService } from '../../services/education.service';

@Component({
    selector: 'app-layout',
    imports: [CommonModule, RouterLink, RouterOutlet, RouterModule, TranslateModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  settings!: UserSettings;
  sidebarColor: string = '';
  sidebarOpen = false;
  userMenuOpen = false;
  supportBadgeCount = 0;
  educationBadgeCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private todoService: TodoService,
    private educationService: EducationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Refresh badge counts when user changes
      if (user) {
        this.todoService.refreshSupportBadgeCount();
        this.educationService.refreshUnreadCount();
      }
    });
  }

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();
    this.sidebarColor = this.settingsService.getSidebarColor();

    // Apply initial theme colors
    this.settingsService.applyThemeColors();

    // Subscribe to settings changes
    this.subscriptions.push(
      this.settingsService.settings$.subscribe(settings => {
        this.settings = settings;
        this.sidebarColor = this.settingsService.getSidebarColor();

        // Apply theme colors when settings change
        this.settingsService.applyThemeColors();
      })
    );

    // Subscribe to support badge count
    this.subscriptions.push(
      this.todoService.supportBadgeCount$.subscribe(count => {
        this.supportBadgeCount = count;
      })
    );

    // Subscribe to education badge count
    this.subscriptions.push(
      this.educationService.unreadCount$.subscribe(count => {
        this.educationBadgeCount = count;
      })
    );

    // Initial badge count fetch
    this.todoService.refreshSupportBadgeCount();
    this.educationService.refreshUnreadCount();

    // Refresh badge counts every 60 seconds
    this.subscriptions.push(
      interval(60000).subscribe(() => {
        if (this.currentUser) {
          this.todoService.refreshSupportBadgeCount();
          this.educationService.refreshUnreadCount();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMenus(): void {
    this.userMenuOpen = false;
  }

  closeMenusAndSidebar(): void {
    this.closeMenus();
    this.closeSidebarOnMobile();
  }
}

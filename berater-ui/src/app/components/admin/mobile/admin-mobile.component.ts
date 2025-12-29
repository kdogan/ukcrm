import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppUser, UserStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-mobile',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mobile.component.html',
  styleUrl: './admin-mobile.component.scss',
  standalone: true
})
export class AdminMobileComponent {
  @Input() users!: AppUser[];
  @Input() stats!: UserStats | null;
  @Input() activeActionMenu: string | null = null;

  @Output() createUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<AppUser>();
  @Output() deleteUser = new EventEmitter<string>();
  @Output() blockUser = new EventEmitter<string>();
  @Output() unblockUser = new EventEmitter<string>();
  @Output() toggleActionMenu = new EventEmitter<string>();
  @Output() closeActionMenu = new EventEmitter<void>();
  @Output() filterRoleChange = new EventEmitter<string>();
  @Output() filterPackageChange = new EventEmitter<string>();
  @Output() filterBlockedChange = new EventEmitter<boolean | undefined>();

  filterRole = '';
  filterPackage = '';
  filterBlocked: boolean | undefined = undefined;

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'berater': 'Berater',
      'admin': 'Admin',
      'superadmin': 'Superadmin'
    };
    return labels[role] || role;
  }

  getPackageLabel(pkg: string): string {
    const labels: { [key: string]: string } = {
      'free': 'Kostenlos',
      'basic': 'Basic',
      'professional': 'Professional',
      'enterprise': 'Enterprise'
    };
    return labels[pkg] || pkg;
  }

  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  onFilterRoleChange(): void {
    this.filterRoleChange.emit(this.filterRole);
  }

  onFilterPackageChange(): void {
    this.filterPackageChange.emit(this.filterPackage);
  }

  onFilterBlockedChange(): void {
    this.filterBlockedChange.emit(this.filterBlocked);
  }
}

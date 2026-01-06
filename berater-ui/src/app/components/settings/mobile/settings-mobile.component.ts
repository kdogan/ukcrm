import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSettings } from 'src/app/services/settings.service';
import { Package, UserLimits } from 'src/app/services/package.service';

@Component({
  selector: 'app-settings-mobile',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-mobile.component.html',
  styleUrl: './settings-mobile.component.scss',
  standalone: true
})
export class SettingsMobileComponent {
  @Input() settings!: UserSettings;
  @Input() userLimits: UserLimits | null = null;
  @Input() packages: Package[] = [];
  @Input() pendingUpgradeRequest: any = null;
  @Input() selectedBillingInterval: { [packageName: string]: 'monthly' | 'yearly' } = {};
  @Input() currentPassword = '';
  @Input() newPassword = '';
  @Input() confirmPassword = '';
  @Input() isChangingPassword = false;
  @Input() profileFirstName = '';
  @Input() profileLastName = '';
  @Input() isSavingProfile = false;
  @Input() currentUserEmail = '';

  // Tab navigation
  activeTab: 'profile' | 'notifications' | 'appearance' | 'package' = 'profile';

  @Output() saveSettingsEvent = new EventEmitter<void>();
  @Output() saveProfileEvent = new EventEmitter<void>();
  @Output() profileFirstNameChange = new EventEmitter<string>();
  @Output() profileLastNameChange = new EventEmitter<string>();
  @Output() resetToDefaultsEvent = new EventEmitter<void>();
  @Output() changePackageEvent = new EventEmitter<{ packageName: string; order: number }>();
  @Output() selectBillingIntervalEvent = new EventEmitter<{ packageName: string; interval: 'monthly' | 'yearly' }>();
  @Output() changePasswordEvent = new EventEmitter<void>();
  @Output() currentPasswordChange = new EventEmitter<string>();
  @Output() newPasswordChange = new EventEmitter<string>();
  @Output() confirmPasswordChange = new EventEmitter<string>();

  getUsagePercentage(type: 'contracts' | 'customers' | 'meters'): number {
    if (!this.userLimits) return 0;

    const usage = this.userLimits.usage[type];
    const limit = this.userLimits.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof this.userLimits.limits];

    if (limit === -1) return 0;
    return Math.min(100, (usage / (limit as number)) * 100);
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

  onSaveSettings(): void {
    this.saveSettingsEvent.emit();
  }

  onResetToDefaults(): void {
    this.resetToDefaultsEvent.emit();
  }

  onChangePackage(packageName: string, order: number): void {
    this.changePackageEvent.emit({ packageName, order });
  }

  onSelectBillingInterval(packageName: string, interval: 'monthly' | 'yearly'): void {
    this.selectBillingIntervalEvent.emit({ packageName, interval });
  }

  isFileUploadEnabled(pkg: Package): boolean {
    const fileUploadFeature = pkg.features?.find(f => f.name === 'file_upload');
    return fileUploadFeature ? fileUploadFeature.enabled : false;
  }
}

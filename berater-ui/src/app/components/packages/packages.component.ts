import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageService, Package, UserLimits } from '../../services/package.service';
import { UpgradeService } from '../../services/upgrade.service';
import { AuthService } from '../../services/auth.service';
import { PaypalService } from '../../services/paypal.service';

@Component({
    selector: 'app-packages',
    imports: [CommonModule, FormsModule],
    templateUrl: './packages.component.html',
    standalone: true,
    styleUrl: './packages.component.scss'
})
export class PackagesComponent implements OnInit {
  packages: Package[] = [];
  showForm = false;
  editingPackage: Package | null = null;
  isSuperAdmin = false;
  userLimits: UserLimits | null = null;
  fileUploadEnabled = false;
  selectedBillingInterval: { [packageName: string]: 'monthly' | 'yearly' } = {};

  formData: Partial<Package> = {
    name: '',
    displayName: '',
    maxContracts: 10,
    maxCustomers: 10,
    maxMeters: 10,
    monthlyPrice: 0,
    currency: 'EUR',
    isActive: true,
    isFree: false,
    order: 1,
    features: []
  };

  constructor(
    private packageService: PackageService,
    private upgradeService: UpgradeService,
    private authService: AuthService,
    private paypalService: PaypalService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isSuperAdmin = user?.role === 'superadmin';
      if (!this.isSuperAdmin) {
        this.loadUserLimits();
      }
    });
    this.loadPackages();
  }

  loadUserLimits(): void {
    this.packageService.getUserLimits().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userLimits = response.data;
        }
      },
      error: (error: any) => console.error('Error loading user limits:', error)
    });
  }

  loadPackages(): void {
    this.packageService.getAllPackages().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.packages = response.data.sort((a: Package, b: Package) => a.order - b.order);
          // Initialize billing interval selection to monthly for all packages
          this.packages.forEach(pkg => {
            if (!this.selectedBillingInterval[pkg.name]) {
              this.selectedBillingInterval[pkg.name] = 'monthly';
            }
          });
        }
      },
      error: (error: any) => console.error('Error loading packages:', error)
    });
  }

  showCreateForm(): void {
    this.editingPackage = null;
    this.formData = {
      name: '',
      displayName: '',
      maxContracts: 10,
      maxCustomers: 10,
      maxMeters: 10,
      monthlyPrice: 0,
      currency: 'EUR',
      isActive: true,
      isFree: false,
      order: this.packages.length + 1,
      features: [{ name: 'file_upload', enabled: false }]
    };
    this.fileUploadEnabled = false;
    this.showForm = true;

    // Nach oben scrollen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editPackage(pkg: Package): void {
    this.editingPackage = pkg;
    this.formData = { ...pkg };

    // Prüfe ob file_upload Feature vorhanden ist
    const fileUploadFeature = pkg.features?.find(f => f.name === 'file_upload');
    this.fileUploadEnabled = fileUploadFeature ? fileUploadFeature.enabled : false;

    this.showForm = true;

    // Nach oben scrollen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateFileUploadFeature(): void {
    if (!this.formData.features) {
      this.formData.features = [];
    }

    const featureIndex = this.formData.features.findIndex(f => f.name === 'file_upload');

    if (featureIndex >= 0) {
      // Feature existiert bereits, aktualisiere es
      this.formData.features[featureIndex].enabled = this.fileUploadEnabled;
    } else {
      // Feature existiert nicht, füge es hinzu
      this.formData.features.push({ name: 'file_upload', enabled: this.fileUploadEnabled });
    }
  }

  savePackage(): void {
    // Sicherstellen, dass numerische Felder korrekt formatiert sind
    const packageData = {
      ...this.formData,
      monthlyPrice: Number(this.formData.monthlyPrice) || 0,
      maxContracts: Number(this.formData.maxContracts) || 0,
      maxCustomers: Number(this.formData.maxCustomers) || 0,
      maxMeters: Number(this.formData.maxMeters) || 0,
      order: Number(this.formData.order) || 0
    };

    if (this.editingPackage) {
      this.packageService.updatePackage(this.editingPackage._id, packageData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
            this.cancelEdit();
          }
        },
        error: (error: any) => {
          console.error('Error updating package:', error);
          alert('Fehler beim Aktualisieren des Pakets');
        }
      });
    } else {
      this.packageService.createPackage(packageData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
            this.cancelEdit();
          }
        },
        error: (error: any) => {
          console.error('Error creating package:', error);
          alert('Fehler beim Erstellen des Pakets');
        }
      });
    }
  }

  deletePackage(id: string): void {
    if (confirm('Möchten Sie dieses Paket wirklich löschen?')) {
      this.packageService.deletePackage(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadPackages();
          }
        },
        error: (error: any) => {
          console.error('Error deleting package:', error);
          alert('Fehler beim Löschen des Pakets');
        }
      });
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingPackage = null;
  }

  getUsagePercentage(type: 'contracts' | 'customers' | 'meters'): number {
    if (!this.userLimits) return 0;

    const usage = this.userLimits.usage[type];
    const limit = this.userLimits.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof this.userLimits.limits] as number;

    if (limit === -1) return 0; // Unlimited
    return (usage / limit) * 100;
  }

  getFeatureName(featureName: string): string {
    const featureNames: { [key: string]: string } = {
      'file_upload': 'Datei-Upload'
    };
    return featureNames[featureName] || featureName;
  }

  isFileUploadEnabled(pkg: Package): boolean {
    const fileUploadFeature = pkg.features?.find(f => f.name === 'file_upload');
    return fileUploadFeature ? fileUploadFeature.enabled : false;
  }

  selectBillingInterval(packageName: string, interval: 'monthly' | 'yearly'): void {
    this.selectedBillingInterval[packageName] = interval;
  }

  changePackage(packageName: string, packageOrder: number): void {
    console.log('🔵 changePackage called:', { packageName, packageOrder });
    const isDowngrade = this.userLimits && packageOrder < this.userLimits.package.order;
    const isUpgrade = this.userLimits && packageOrder > this.userLimits.package.order;
    const action = isDowngrade ? 'Downgrade' : 'Upgrade';
    const billingInterval = this.selectedBillingInterval[packageName] || 'monthly';
    console.log('🔵 Action type:', { isDowngrade, isUpgrade, action, billingInterval });

    const targetPackage = this.packages.find(p => p.name === packageName);
    if (!targetPackage) {
      console.error('❌ Target package not found:', packageName);
      return;
    }
    console.log('🔵 Target package:', targetPackage);

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
      console.log('🟢 User confirmed the action');
      // For downgrades and free packages, use the old method (no payment needed)
      if (isDowngrade || targetPackage.isFree) {
        console.log('🔵 Using direct upgrade (downgrade or free package)');
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
        console.log('🟡 Using PayPal for upgrade (paid package)');
        this.purchaseWithPayPal(packageName, billingInterval);
      }
    } else {
      console.log('🔴 User cancelled the action');
    }
  }

  purchaseWithPayPal(packageName: string, billingInterval: 'monthly' | 'yearly'): void {
    console.log('🟡 purchaseWithPayPal called:', { packageName, billingInterval });
    this.paypalService.createOrder(packageName, billingInterval).subscribe({
      next: (response) => {
        console.log('✅ PayPal createOrder response:', response);
        if (response.success && response.approvalUrl) {
          // Store order ID in sessionStorage for later capture
          sessionStorage.setItem('paypalOrderId', response.orderId);
          sessionStorage.setItem('paypalPackageName', packageName);
          sessionStorage.setItem('paypalBillingInterval', billingInterval);
          console.log('🟢 Redirecting to PayPal:', response.approvalUrl);

          // Redirect to PayPal
          window.location.href = response.approvalUrl;
        } else {
          console.error('❌ Invalid PayPal response:', response);
          alert('Fehler beim Erstellen der PayPal-Bestellung');
        }
      },
      error: (error) => {
        console.error('❌ Error creating PayPal order:', error);
        alert('Fehler beim Erstellen der PayPal-Bestellung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, Customer } from '../../services/customer.service';
import { ContractService } from '../../services/contract.service';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { ViewportService, ViewportType } from 'src/app/services/viewport.service';
import { CustomersMobileComponent } from "./mobile/customers-mobile/customers-mobile.component";
import { OverlayModalComponent } from "../shared/overlay-modal.component";
import { CustomerDetailComponent, CustomerContract } from "../shared/customer-detail.component";
import { CustomerFormComponent, CustomerFormData } from '../shared/customer-form.component';
import { Contract } from 'src/app/models/contract.model';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
    selector: 'app-customers',
    imports: [CommonModule, FormsModule, TableContainerComponent, CustomersMobileComponent, OverlayModalComponent, CustomerDetailComponent, CustomerFormComponent, TranslateModule],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';
  filterActive?: boolean = undefined;
  showModal = false;
  editMode = false;
  currentCustomer: Partial<Customer> = {};
  activeMenuId: string | null = null;
  savingCustomer = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Customer Details Modal
  showCustomerDetailsModal = false;
  selectedCustomer: Customer | null = null;
  customerContracts: Contract[] = [];

  constructor(
    private customerService: CustomerService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private viewport: ViewportService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    private excelExportService: ExcelExportService
  ) {}

    get isMobile() {
      return this.viewport.isMobile();
    }

  ngOnInit(): void {
    // Prüfe ob eine ID in der Route vorhanden ist
    this.route.params.subscribe(params => {
      const customerId = params['id'];
      if (customerId) {
        // Zeige Kunde bearbeiten Modal
        this.loadCustomerById(customerId);
      } else {
        this.loadCustomers();
      }
    });
  }

  loadCustomerById(id: string): void {
    // Lade zuerst die Kundenliste
    this.loadCustomers();

    // Dann lade den spezifischen Kunden und öffne das Modal
    this.customerService.getCustomer(id).subscribe({
      next: (response) => {
        if (response.success) {
          const customer = response.data;
          this.currentCustomer = customer;
          this.customerFormData = {
            _id: customer._id,
            anrede: customer.anrede,
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email,
            phone: customer.phone,
            notes: customer.notes,
            address: {
              street: customer.address?.street ?? '',
              zip: customer.address?.zip ?? '',
              city: customer.address?.city ?? ''
            }
          };
          this.editMode = true;
          this.showModal = true;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Kunden:', error);
        this.toastService.error('Kunde konnte nicht geladen werden');
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers({
      isActive: this.filterActive,
      search: this.searchTerm,
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.pages;
            this.currentPage = response.pagination.page;
          }
        }
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearchChange(): void {
    this.currentPage = 1;
    setTimeout(() => this.loadCustomers(), 300);
  }

  showCreateModal(): void {
    this.editMode = false;
    this.currentCustomer = {};
    this.customerFormData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      address: {
        street: '',
        zip: '',
        city: ''
      }
    };
    this.showModal = true;
  }

  editCustomer(customer: Customer) {
    this.editMode = true;
    this.currentCustomer = { ...customer };
    this.customerFormData = {
      _id: customer._id,
      anrede: customer.anrede,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      address: {
        street: customer.address?.street ?? '',
        zip: customer.address?.zip ?? '',
        city: customer.address?.city ?? ''
      }
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCustomer = {};
  }

  saveCustomer(customerData: CustomerFormData): void {
    this.savingCustomer = true;
    const customerPayload: any = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      notes: customerData.notes,
      address: {
        street: customerData.address?.street || '',
        zip: customerData.address?.zip || '',
        city: customerData.address?.city || ''
      }
    };

    // Nur anrede hinzufügen wenn es gesetzt ist (nicht undefined)
    if (customerData.anrede) {
      customerPayload.anrede = customerData.anrede;
    }

    if (this.editMode && customerData._id) {
      this.customerService.updateCustomer(customerData._id, customerPayload).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
          this.savingCustomer = false;
        },
        error: () => {
          this.savingCustomer = false;
        }
      });
    } else {
      this.customerService.createCustomer(customerPayload).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
          this.savingCustomer = false;
        },
        error: () => {
          this.savingCustomer = false;
        }
      });
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Kunde löschen',
      message: 'Möchten Sie diesen Kunden wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Kunde erfolgreich gelöscht');
          this.loadCustomers();
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Kunde konnte nicht gelöscht werden';
        this.toastService.error(errorMessage);
      }
    });
  }

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }

  showCustomerDetails(customer: Customer): void {
    this.selectedCustomer = customer;
    this.showCustomerDetailsModal = true;
    this.loadCustomerContracts(customer._id);
  }

  closeCustomerDetailsModal(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomer = null;
    this.customerContracts = [];
  }

  loadCustomerContracts(customerId: string): void {
    this.contractService.getContracts({ customerId }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerContracts = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Verträge:', error);
        this.customerContracts = [];
      }
    });
  }

  navigateToContract(contractId: string): void {
    this.closeCustomerDetailsModal();
    this.router.navigate(['/contracts', contractId]);
  }

  onContractClick(contract: CustomerContract): void {
    this.navigateToContract(contract._id);
  }

  createContractForCustomer(customer: Customer): void {
    this.router.navigate(['/contracts'], { queryParams: { customerId: customer._id } });
  }

  customerFormData: CustomerFormData = {
    firstName: '',
    lastName: ''
  };

  exportToExcel(): void {
    // Lade alle Kunden ohne Pagination für den Export
    this.customerService.getCustomers({
      isActive: this.filterActive,
      search: this.searchTerm,
      limit: 10000
    }).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.excelExportService.exportCustomers(response.data, 'Kunden');
          this.toastService.success('Export erfolgreich');
        } else {
          this.toastService.info('Keine Daten zum Exportieren');
        }
      },
      error: () => {
        this.toastService.error('Export fehlgeschlagen');
      }
    });
  }
}

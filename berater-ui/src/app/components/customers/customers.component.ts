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
import { Contract } from 'src/app/models/contract.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-customers',
    imports: [CommonModule, FormsModule, TableContainerComponent, CustomersMobileComponent, OverlayModalComponent, CustomerDetailComponent, TranslateModule],
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

  // Customer Details Modal
  showCustomerDetailsModal = false;
  selectedCustomer: Customer | null = null;
  customerContracts: Contract[] = [];

  constructor(
    private customerService: CustomerService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private viewport: ViewportService
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
          this.currentCustomer = response.data;
          this.editMode = true;
          this.showModal = true;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Kunden:', error);
        alert('Kunde konnte nicht geladen werden');
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers({
      isActive: this.filterActive,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
        }
      }
    });
  }

  onSearchChange(): void {
    setTimeout(() => this.loadCustomers(), 300);
  }

  showCreateModal(): void {
    this.editMode = false;
    this.currentCustomer = {
      address: {
        street: '',
        zip: '',
        city: '',
        country: ''
      }
    };
    this.showModal = true;
  }

  editCustomer(customer: Customer) {
    this.editMode = true;
    this.currentCustomer = {
      ...customer,
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

  saveCustomer(): void {
    if (this.editMode && this.currentCustomer._id) {
      this.customerService.updateCustomer(this.currentCustomer._id, this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        }
      });
    } else {
      this.customerService.createCustomer(this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        }
      });
    }
  }

  deleteCustomer(id: string): void {
    if (confirm('Kunde wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCustomers();
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Kunde konnte nicht gelöscht werden';
          alert(errorMessage);
        }
      });
    }
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
    this.contractService.getContracts().subscribe({
      next: (response) => {
        if (response.success) {
          // Filter contracts by customerId
          this.customerContracts = response.data.filter(
            (contract: Contract) => contract.customerId?._id === customerId || contract.customerId === customerId
          );
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
}

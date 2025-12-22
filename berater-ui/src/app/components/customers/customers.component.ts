import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomerService, Customer } from '../../services/customer.service';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { ViewportService, ViewportType } from 'src/app/services/viewport.service';
import { CustomersMobileComponent } from "./mobile/customers-mobile/customers-mobile.component";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, TableContainerComponent, CustomersMobileComponent],
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
  

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
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
    this.currentCustomer = {};
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

  deactivateCustomer(id: string): void {
    if (confirm('Kunde wirklich deaktivieren?')) {
      this.customerService.deactivateCustomer(id).subscribe({
        next: () => this.loadCustomers()
      });
    }
  }

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }
}

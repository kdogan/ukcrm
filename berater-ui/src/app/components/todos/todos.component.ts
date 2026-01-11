import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TodoService, Todo, CreateTodoDto, TodoTopic } from '../../services/todo.service';
import { CustomerService } from '../../services/customer.service';
import { ContractService } from '../../services/contract.service';
import { MeterService } from '../../services/meter.service';
import { TodoComponent } from "./todo.component";
import { ViewportService } from 'src/app/services/viewport.service';
import { TodosDesktopComponent } from './desktop/todos-desktop.component';
import { TodosMobileComponent } from './mobile/todos-mobile.component';
import { OverlayModalComponent } from '../shared/overlay-modal.component';
import { Util } from '../util/util';
import { CustomerSearchComponent } from '../shared/customer-search.component';
import { ContractSearchComponent } from '../shared/contract-search.component';
import { MeterSearchComponent } from '../shared/meter-search.component';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
    selector: 'app-todos',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, TodoComponent,
      TodosDesktopComponent, TodosMobileComponent, OverlayModalComponent,
      CustomerSearchComponent, ContractSearchComponent, MeterSearchComponent],
    templateUrl: './todos.component.html',
    styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit {

  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  showCompleted = false;
  showModal = false;
  isEditMode = false;
  currentTodo: any = this.getEmptyTodo();

  // Themen für TODOs (werden vom Server geladen)
  topics: TodoTopic[] = [];
  selectedTopic = '';
  customTopic = '';
  showAddTopic = false;
  newTopicName = '';

  // Daten für Verknüpfungen
  customers: any[] = [];
  contracts: any[] = [];
  meters: any[] = [];

  // Suchfelder für Verknüpfungen
  customerSearch = '';
  contractSearch = '';
  meterSearch = '';
  filteredCustomers: any[] = [];
  filteredContracts: any[] = [];
  filteredMeters: any[] = [];
  showCustomerDropdown = false;
  showContractDropdown = false;
  showMeterDropdown = false;
  selectedCustomer: any = null;
  selectedContract: any = null;
  selectedMeter: any = null;

  /* 🔹 Views */
  mainView: 'list' | 'calendar' = 'list';
  calendarView: 'month' | 'day' = 'month';
  calendarDate: Date = new Date();
  selectedDay: Date | null = null;

  constructor(
    private todoService: TodoService,
    private customerService: CustomerService,
    private contractService: ContractService,
    private meterService: MeterService,
    private router: Router,
    public viewportService: ViewportService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.loadTodos();
    this.loadRelatedData();
    this.loadTopics();
  }

  loadTopics(): void {
    this.todoService.getTopics().subscribe({
      next: (response) => {
        if (response.success) {
          this.topics = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Themen:', error);
      }
    });
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (response) => {
        if (response.success) {
          this.todos = response.data;
          this.filterTodos();
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der TODOs:', error);
      }
    });
  }
  loadRelatedData(): void {
    // Lade Kunden für Dropdown
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
          this.filteredCustomers = this.customers;
        }
      }
    });

    // Lade Verträge für Dropdown
    this.contractService.getContracts().subscribe({
      next: (response) => {
        if (response.success) {
          this.contracts = response.data;
          this.filteredContracts = this.contracts;
        }
      }
    });

    // Lade Zähler für Dropdown
    this.meterService.getMeters().subscribe({
      next: (response) => {
        if (response.success) {
          this.meters = response.data;
          this.filteredMeters = this.meters;
        }
      }
    });
  }

  filterTodos(): void {
    this.filteredTodos = this.todos.filter(todo => {
      const matchesSearch = !this.searchTerm ||
        todo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.statusFilter || todo.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || todo.priority === this.priorityFilter;

      // Hide completed todos unless showCompleted is true
      const matchesCompleted = this.showCompleted || todo.status !== 'completed';

      return matchesSearch && matchesStatus && matchesPriority && matchesCompleted;
    });
  }

  onFilterChange(filters: { status: string; priority: string; search: string; showCompleted: boolean }): void {
    this.searchTerm = filters.search;
    this.statusFilter = filters.status;
    this.priorityFilter = filters.priority;
    this.showCompleted = filters.showCompleted;
    this.filterTodos();
  }

  getEmptyTodo(): CreateTodoDto {
    return {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      dueDate: this.selectedDay ? this.formatDateForInput(this.selectedDay) : '',
      relatedCustomerId: undefined,
      relatedContractId: undefined,
      relatedMeterId: undefined
    };
  }

  formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  showCreateModal(): void {
    this.currentTodo = this.getEmptyTodo();
    this.isEditMode = false;
    this.resetSearchFields();
    this.selectedTopic = '';
    this.customTopic = '';
    this.showModal = true;
  }

  resetSearchFields(): void {
    this.customerSearch = '';
    this.contractSearch = '';
    this.meterSearch = '';
    this.selectedCustomer = null;
    this.selectedContract = null;
    this.selectedMeter = null;
    this.showCustomerDropdown = false;
    this.showContractDropdown = false;
    this.showMeterDropdown = false;
    this.filteredCustomers = this.customers;
    this.filteredContracts = this.contracts;
    this.filteredMeters = this.meters;
  }

  // Customer-Suche
  filterCustomers(): void {
    const search = this.customerSearch.toLowerCase().trim();
    if (!search) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(customer => {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        const customerNumber = customer.customerNumber?.toLowerCase() || '';
        return fullName.includes(search) || customerNumber.includes(search);
      });
    }
    this.showCustomerDropdown = true;
  }

  selectCustomer(customer: any): void {
    this.selectedCustomer = customer;
    this.currentTodo.relatedCustomerId = customer._id;
  }

  onCustomerSelected(customer: any): void {
    this.selectCustomer(customer);
  }

  onCustomerCleared(): void {
    this.clearCustomer();
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.currentTodo.relatedCustomerId = null;
    this.customerSearch = '';
    this.filteredCustomers = this.customers;
  }

  closeCustomerDropdownDelayed(): void {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 200);
  }

  // Contract-Suche
  filterContracts(): void {
    const search = this.contractSearch.toLowerCase().trim();
    if (!search) {
      this.filteredContracts = this.contracts;
    } else {
      this.filteredContracts = this.contracts.filter(contract => {
        const contractNumber = contract.contractNumber?.toLowerCase() || '';
        const customerName = contract.customerId ?
          `${contract.customerId.firstName} ${contract.customerId.lastName}`.toLowerCase() : '';
        return contractNumber.includes(search) || customerName.includes(search);
      });
    }
    this.showContractDropdown = true;
  }

  selectContract(contract: any): void {
    this.selectedContract = contract;
    this.currentTodo.relatedContractId = contract._id;
  }

  onContractSelected(contract: any): void {
    this.selectContract(contract);
  }

  onContractCleared(): void {
    this.clearContract();
  }

  clearContract(): void {
    this.selectedContract = null;
    this.currentTodo.relatedContractId = null;
    this.contractSearch = '';
    this.filteredContracts = this.contracts;
  }

  closeContractDropdownDelayed(): void {
    setTimeout(() => {
      this.showContractDropdown = false;
    }, 200);
  }

  // Meter-Suche
  filterMeters(): void {
    const search = this.meterSearch.toLowerCase().trim();
    if (!search) {
      this.filteredMeters = this.meters;
    } else {
      this.filteredMeters = this.meters.filter(meter => {
        const meterNumber = meter.meterNumber?.toLowerCase() || '';
        const type = this.getTypeLabel(meter.type).toLowerCase();
        return meterNumber.includes(search) || type.includes(search);
      });
    }
    this.showMeterDropdown = true;
  }

  selectMeter(meter: any): void {
    this.selectedMeter = meter;
    this.currentTodo.relatedMeterId = meter._id;
  }

  onMeterSelected(meter: any): void {
    this.selectMeter(meter);
  }

  onMeterCleared(): void {
    this.clearMeter();
  }

  clearMeter(): void {
    this.selectedMeter = null;
    this.currentTodo.relatedMeterId = null;
    this.meterSearch = '';
    this.filteredMeters = this.meters;
  }

  closeMeterDropdownDelayed(): void {
    setTimeout(() => {
      this.showMeterDropdown = false;
    }, 200);
  }

  editTodo(todo: Todo): void {
    this.currentTodo = {
      _id: todo._id,
      title: todo.title,
      description: todo.description || '',
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      relatedCustomerId: todo.relatedCustomerId?._id || null,
      relatedContractId: todo.relatedContractId?._id || null,
      relatedMeterId: todo.relatedMeterId?._id || null
    };

    // Setze die ausgewählten Werte für die Suchfelder
    this.resetSearchFields();

    // Kunde
    if (todo.relatedCustomerId) {
      this.selectedCustomer = todo.relatedCustomerId;
      this.customerSearch = `${todo.relatedCustomerId.firstName} ${todo.relatedCustomerId.lastName}`;
    }

    // Vertrag
    if (todo.relatedContractId) {
      this.selectedContract = todo.relatedContractId;
      const customerName = todo.relatedContractId.customerId ?
        `${todo.relatedContractId.customerId.firstName} ${todo.relatedContractId.customerId.lastName}` : '';
      this.contractSearch = `${todo.relatedContractId.contractNumber} - ${customerName}`;
    }

    // Zähler
    if (todo.relatedMeterId) {
      this.selectedMeter = todo.relatedMeterId;
      this.meterSearch = `${todo.relatedMeterId.meterNumber} (${this.getTypeLabel(todo.relatedMeterId.type)})`;
    }

    // Thema ermitteln basierend auf dem Titel
    const matchingTopic = this.topics.find(t => t.name === todo.title);
    if (matchingTopic) {
      this.selectedTopic = matchingTopic._id;
      this.customTopic = '';
    } else {
      this.selectedTopic = 'other';
      this.customTopic = todo.title;
    }

    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentTodo = this.getEmptyTodo();
    this.isEditMode = false;
    this.selectedTopic = '';
    this.customTopic = '';
    this.showAddTopic = false;
    this.newTopicName = '';
  }

  onTopicChange(): void {
    if (this.selectedTopic && this.selectedTopic !== 'other') {
      const topic = this.topics.find(t => t._id === this.selectedTopic);
      if (topic) {
        this.currentTodo.title = topic.name;
      }
    } else if (this.selectedTopic === 'other') {
      this.currentTodo.title = this.customTopic;
    }
  }

  onCustomTopicChange(): void {
    if (this.selectedTopic === 'other') {
      this.currentTodo.title = this.customTopic;
    }
  }

  toggleAddTopic(): void {
    this.showAddTopic = !this.showAddTopic;
    this.newTopicName = '';
  }

  addNewTopic(): void {
    if (!this.newTopicName.trim()) return;

    this.todoService.createTopic(this.newTopicName.trim()).subscribe({
      next: (response) => {
        if (response.success) {
          this.topics.push(response.data);
          this.selectedTopic = response.data._id;
          this.currentTodo.title = response.data.name;
          this.showAddTopic = false;
          this.newTopicName = '';
          this.toastService.success('Thema erfolgreich erstellt');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Fehler beim Erstellen des Themas');
      }
    });
  }

  deleteTopic(topicId: string, event: Event): void {
    event.stopPropagation();
    const topic = this.topics.find(t => t._id === topicId);
    if (!topic || topic.isDefault) return;

    this.todoService.deleteTopic(topicId).subscribe({
      next: (response) => {
        if (response.success) {
          this.topics = this.topics.filter(t => t._id !== topicId);
          if (this.selectedTopic === topicId) {
            this.selectedTopic = '';
            this.currentTodo.title = '';
          }
          this.toastService.success('Thema gelöscht');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Fehler beim Löschen des Themas');
      }
    });
  }

  saveTodo(): void {
    const todoData = { ...this.currentTodo };

    // Entferne null-Werte für optionale Felder
    if (!todoData.relatedCustomerId) delete todoData.relatedCustomerId;
    if (!todoData.relatedContractId) delete todoData.relatedContractId;
    if (!todoData.relatedMeterId) delete todoData.relatedMeterId;
    if (!todoData.dueDate) delete todoData.dueDate;

    if (this.isEditMode) {
      this.todoService.updateTodo(this.currentTodo._id, todoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('TODO erfolgreich gespeichert');
            this.loadTodos();
            this.closeModal();
          }
        },
        error: (error) => {
          this.toastService.error('Fehler beim Speichern: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      this.todoService.createTodo(todoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('TODO erfolgreich erstellt');
            this.loadTodos();
            this.closeModal();
          }
        },
        error: (error) => {
          this.toastService.error('Fehler beim Erstellen: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  async deleteTodo(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'TODO löschen',
      message: 'Möchten Sie dieses TODO wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.todoService.deleteTodo(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('TODO erfolgreich gelöscht');
          this.loadTodos();
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Löschen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  completeTodo(id: string): void {
    this.todoService.completeTodo(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('TODO erfolgreich abgeschlossen');
          this.loadTodos();
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Abschließen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  async generateAutoTodos(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Automatische TODOs generieren',
      message: 'Möchten Sie automatische TODOs für ablaufende Verträge generieren?',
      confirmText: 'Generieren',
      cancelText: 'Abbrechen',
      type: 'info'
    });

    if (!confirmed) return;

    this.todoService.generateExpiringContractTodos().subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.loadTodos();
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Generieren: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  navigateToCustomer(customerId: string): void {
    // Navigation zur Kunden-Detailseite
    this.router.navigate(['/customers', customerId]);
  }

  navigateToContract(contractId: string): void {
    // Navigation zur Vertrags-Detailseite
    this.router.navigate(['/contracts', contractId]);
  }

  navigateToMeter(meterId: string): void {
    // Navigation zur Zähler-Detailseite
    this.router.navigate(['/meters', meterId]);
  }

  getTypeLabel(type: string): string {
    return Util.getMeterTypeLabel(type);
  }

  getCustomerAddress(customer: any): string {
    if (!customer?.address) return '';
    const { street, zipCode, city } = customer.address;
    const parts = [street, zipCode, city].filter(p => p);
    return parts.join(' ');
  }
  // Kalender-Ansicht Methoden
  get monthDays(): Date[] {
    const first = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  todosForDate(date: Date): Todo[] {
    return this.filteredTodos.filter(t => {
      if (!t.dueDate) return false;

      const todoDate = new Date(t.dueDate);
      return this.sameDate(todoDate, date);
    });
  }

  openDay(date: Date): void {
    this.selectedDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this.calendarView = 'day';
  }


  backToMonth(): void {
    this.calendarView = 'month';
    this.selectedDay = null;
  }

  changeMonth(step: number): void {
    this.calendarDate = new Date(
      this.calendarDate.getFullYear(),
      this.calendarDate.getMonth() + step,
      1
    );
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.calendarDate.getMonth();
  }

  sameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

}

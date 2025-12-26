import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService, Todo, CreateTodoDto } from '../../services/todo.service';
import { CustomerService } from '../../services/customer.service';
import { ContractService } from '../../services/contract.service';
import { MeterService } from '../../services/meter.service';
import { TodoComponent } from "./todo.component";

@Component({
    selector: 'app-todos',
    imports: [CommonModule, FormsModule, TodoComponent],
    templateUrl: './todos.component.html',
    styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit {

  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  showModal = false;
  isEditMode = false;
  currentTodo: any = this.getEmptyTodo();

  // Daten für Verknüpfungen
  customers: any[] = [];
  contracts: any[] = [];
  meters: any[] = [];

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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTodos();
    this.loadRelatedData();
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
        }
      }
    });

    // Lade Verträge für Dropdown
    this.contractService.getContracts().subscribe({
      next: (response) => {
        if (response.success) {
          this.contracts = response.data;
        }
      }
    });

    // Lade Zähler für Dropdown
    this.meterService.getMeters().subscribe({
      next: (response) => {
        if (response.success) {
          this.meters = response.data;
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

      return matchesSearch && matchesStatus && matchesPriority;
    });
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
    this.showModal = true;
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
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentTodo = this.getEmptyTodo();
    this.isEditMode = false;
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
            this.loadTodos();
            this.closeModal();
          }
        },
        error: (error) => {
          alert('Fehler beim Speichern: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      this.todoService.createTodo(todoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTodos();
            this.closeModal();
          }
        },
        error: (error) => {
          alert('Fehler beim Erstellen: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  deleteTodo(id: string): void {
    if (!confirm('Möchten Sie dieses TODO wirklich löschen?')) {
      return;
    }

    this.todoService.deleteTodo(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTodos();
        }
      },
      error: (error) => {
        alert('Fehler beim Löschen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  completeTodo(id: string): void {
    this.todoService.completeTodo(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTodos();
        }
      },
      error: (error) => {
        alert('Fehler beim Abschließen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  generateAutoTodos(): void {
    if (!confirm('Möchten Sie automatische TODOs für ablaufende Verträge generieren?')) {
      return;
    }

    this.todoService.generateExpiringContractTodos().subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.loadTodos();
        }
      },
      error: (error) => {
        alert('Fehler beim Generieren: ' + (error.error?.message || 'Unbekannter Fehler'));
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
    const labels: any = {
      electricity: 'Strom',
      gas: 'Gas',
      water: 'Wasser',
      heat: 'Wärme'
    };
    return labels[type] || type;
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

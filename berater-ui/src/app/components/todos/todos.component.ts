import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService, Todo, CreateTodoDto } from '../../services/todo.service';
import { CustomerService } from '../../services/customer.service';
import { ContractService } from '../../services/contract.service';
import { MeterService } from '../../services/meter.service';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private todoService: TodoService,
    private customerService: CustomerService,
    private contractService: ContractService,
    private meterService: MeterService,
    private router: Router
  ) {}

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
      dueDate: '',
      relatedCustomerId: undefined,
      relatedContractId: undefined,
      relatedMeterId: undefined
    };
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

  getPriorityLabel(priority: string): string {
    const labels: any = {
      high: 'Hoch',
      medium: 'Mittel',
      low: 'Niedrig'
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      completed: 'Erledigt'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      electricity: 'Strom',
      gas: 'Gas',
      water: 'Wasser'
    };
    return labels[type] || type;
  }

  isOverdue(dueDate: Date): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  hasRelations(todo: Todo): boolean {
    return !!(
      (todo.relatedCustomerId && typeof todo.relatedCustomerId === 'object' && todo.relatedCustomerId.firstName) ||
      (todo.relatedContractId && typeof todo.relatedContractId === 'object' && todo.relatedContractId.contractNumber) ||
      (todo.relatedMeterId && typeof todo.relatedMeterId === 'object' && todo.relatedMeterId.meterNumber)
    );
  }
}

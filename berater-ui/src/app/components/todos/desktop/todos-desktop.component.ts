import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from 'src/app/services/todo.service';
import { TodoComponent } from '../todo.component';
import { SearchInputComponent } from '../../shared/search-input.component';

@Component({
  selector: 'app-todos-desktop',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoComponent, SearchInputComponent],
  templateUrl: './todos-desktop.component.html',
  styleUrls: ['./todos-desktop.component.scss']
})
export class TodosDesktopComponent {
  @Input({ required: true }) filteredTodos!: Todo[];
  @Input() mainView: 'list' | 'calendar' = 'list';
  @Input() calendarView: 'month' | 'day' = 'month';
  @Input() calendarDate!: Date;
  @Input() selectedDay: Date | null = null;
  @Input() monthDays!: Date[];

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<string>();
  @Output() complete = new EventEmitter<string>();
  @Output() generateAuto = new EventEmitter<void>();
  @Output() mainViewChange = new EventEmitter<'list' | 'calendar'>();
  @Output() filterChange = new EventEmitter<{ status: string; priority: string; search: string }>();
  @Output() navigateToCustomer = new EventEmitter<string>();
  @Output() navigateToContract = new EventEmitter<string>();
  @Output() navigateToMeter = new EventEmitter<string>();
  @Output() changeMonthEvent = new EventEmitter<number>();
  @Output() openDayEvent = new EventEmitter<Date>();
  @Output() backToMonthEvent = new EventEmitter<void>();

  statusFilter = 'open';
  priorityFilter = '';
  searchTerm = '';

  onFilterChange(): void {
    this.filterChange.emit({
      status: this.statusFilter,
      priority: this.priorityFilter,
      search: this.searchTerm
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.onFilterChange();
  }

  todosForDate(date: Date): Todo[] {
    return this.filteredTodos.filter(t => {
      if (!t.dueDate) return false;
      const todoDate = new Date(t.dueDate);
      return this.sameDate(todoDate, date);
    });
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

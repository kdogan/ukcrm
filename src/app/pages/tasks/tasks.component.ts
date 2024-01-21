import { Component } from '@angular/core';
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed';
}
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})

export class TasksComponent {

  tasks: Task[] = [
    { id: 1, title: 'Der Vertrag v123456 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: 'active' },
    { id: 2, title: 'lkdjflksdfl sldkflskdjf lksdflk ',description: 'Der Vertrag v123456 läuft ab', status: 'completed' },
    { id: 3, title: 'Der Vertrag v555888 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: 'active' }
  ];

  addTask() {
    this.tasks.push({ id: this.tasks.length+1, title: 'Der Vertrag v123456 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: 'active' })
  }
}

import { Component } from '@angular/core';
export interface Task {
  id: number;
  title: string;
  status: 'active' | 'completed';
}
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})

export class TasksComponent {

  tasks: Task[] = [
    { id: 1, title: 'Der Vertrag v123456 läuft ab', status: 'active' },
    { id: 2, title: 'lkdjflksdfl sldkflskdjf lksdflk ', status: 'completed' },
    { id: 3, title: 'Der Vertrag v555888 läuft ab', status: 'active' }
  ];
}

import { Component } from '@angular/core';
import { Task } from '../tasks/tasks.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  //TODO hier sollen letzte fünf Tasks nur gezeigt werden
  tasks: Task[] = [
    { id: 1, title: 'Der Vertrag v123456 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: 'active' },
    { id: 2, title: 'lkdjflksdfl sldkflskdjf lksdflk ',description: 'Der Vertrag v123456 läuft ab', status: 'completed' },
    { id: 3, title: 'Der Vertrag v555888 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: 'active' }
  ];
}

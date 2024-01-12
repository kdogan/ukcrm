import { Component, Input } from '@angular/core';
import { Contract } from '../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vertrag-list',
  templateUrl: './vertrag-list.component.html',
  styleUrl: './vertrag-list.component.scss'
})
export class VertragListComponent {

  @Input() vertraege!:Contract[];
  selectedTask: Contract | null = null;
  showModal: boolean = false;
  constructor(private readonly route:Router){}

  showVertrag(vertrag: Contract) {
    this.route.navigate(['vertraege/view', vertrag.vertragnummer])
    }
}

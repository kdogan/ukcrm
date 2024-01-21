import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Contract } from '../../../core/models';

@Component({
  selector: 'app-vertrag-list',
  templateUrl: './vertrag-list.component.html',
  styleUrl: './vertrag-list.component.scss'
})
export class VertragListComponent {
isMobile = false;
deleteVertrag(_t67: any) {
throw new Error('Method not implemented.');
}
editVertrag(_t67: any) {
throw new Error('Method not implemented.');
}

  @Input() vertraege!:Contract[];
  selectedTask: Contract | null = null;
  showModal: boolean = false;
  displayedColumns: string[] = ['zaehlernummer','vertragnummer','vertragstart','vertragsende','status','actions'];
  constructor(private readonly route:Router){}

  showVertrag(vertrag: Contract) {
    this.route.navigate(['vertraege/view', vertrag.vertragnummer])
    }
}

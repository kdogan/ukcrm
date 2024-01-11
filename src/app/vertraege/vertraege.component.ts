import { Component } from '@angular/core';

@Component({
  selector: 'app-vertraege',
  templateUrl: './vertraege.component.html',
  styleUrl: './vertraege.component.scss'
})
export class VertraegeComponent {
  vertraege = [
    { id: 1, name: 'Vertrag 1' },
    { id: 2, name: 'Vertrag 2' },
    // Weitere Mock-Verträge
  ];

  constructor() { }

  addVertrag() {
    // Logik zum Hinzufügen eines neuen Vertrags
    console.log('Neuer Vertrag hinzufügen');
  }
}

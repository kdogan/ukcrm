import { Component } from '@angular/core';
import { Contract } from '../core/models';

@Component({
  selector: 'app-vertraege',
  templateUrl: './vertraege.component.html',
  styleUrl: './vertraege.component.scss'
})
export class VertraegeComponent {

  vertraege: Contract[] = [
    { id: "1234", zaehlernummer: 'D12345678',vertragnummer: 'D12345678',vertragstart: '31.08.2023',vertragsende: '31.08.2024',firma:"EnBW", kundennummer:"1234567",status: false },
    { id: "4321", zaehlernummer: 'ZDK776543',vertragnummer: 'D12345678',vertragstart: '31.08.2023',vertragsende: '31.08.2024',firma:"Rheinenergie", kundennummer:"7654321",status: true },
    { id: "76543", zaehlernummer: 'ZDK11133',vertragnummer: 'D12345678',vertragstart: '31.08.2023',vertragsende: '31.08.2024',firma:"Vattenfall", kundennummer:"77774444",status: false }
  ];

  addVertrag() {
    console.log('Neuer Vertrag hinzufügen');
  }
}

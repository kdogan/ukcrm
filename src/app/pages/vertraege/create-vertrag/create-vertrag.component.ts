import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-vertrag',
  templateUrl: './create-vertrag.component.html',
  styleUrl: './create-vertrag.component.scss'
})
export class CreateVertragComponent  implements OnInit {
  vertragForm!: FormGroup;

  ngOnInit() {
    this.vertragForm = new FormGroup({
      zaehlernummer: new FormControl(''),
      vertragnummer: new FormControl(''),
      firma: new FormControl(''),
      vertragstart: new FormControl(''),
      vertragsende: new FormControl(''),
      status: new FormControl(''), // Hier müssen Sie entscheiden, wie Sie ContractState handhaben wollen
      kundennummer: new FormControl('')
    });
  }

  onSubmit() {
    // Hier können Sie die Logik für das Senden des Formulars implementieren
    console.log(this.vertragForm.value);
  }
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Address } from 'src/app/services/customer.service';

@Component({
    selector: 'app-address',
    imports: [],
    template: `
    @if(address){
    <div>
      <div class="modal-content" (click)="$event.stopPropagation()">
        <ng-content/>
      </div>
    </div>
}
  `,
    styles: `
  .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90%;
    overflow-y: auto;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    position: relative;
  }
  `
})
export class AddressComponent {

  @Input() address! : Address;
}

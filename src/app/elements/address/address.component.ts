import { Component } from '@angular/core';
import { Address } from '../../core/models';

@Component({
  selector: 'app-address',
  template: `<div class='address'>
              <span>{{ address.street }}</span>
              <span>{{ address.zipCode }}, {{ address.city }}</span>
              <span>{{ address.country }}</span>
            </div>`,
  styles: ``
})
export class AddressComponent {
  address:Address = {
    street: 'Daglagstr. 13',
    city: 'Karlsruhe',
    zipCode: '76877',
    country: 'Deutschland'
  };
}

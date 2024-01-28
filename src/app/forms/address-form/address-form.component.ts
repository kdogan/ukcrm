import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Address } from '../../core/models';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent {

  @Output() isAddressValidation:EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() address:EventEmitter<Address> = new EventEmitter<Address>();

  addressForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['', Validators.required]
    });
    this.addressForm.statusChanges.subscribe(status => {
      this.isAddressValidation.emit(status === 'VALID');
      if(status === 'VALID'){
        this.address.next({
          street:this.addressForm.get('street')?.value,
          city:this.addressForm.get('city')?.value,
          zipCode:this.addressForm.get('zip')?.value,
          country:this.addressForm.get('country')?.value
        })
      }
    });
  }

  isFieldInvalid(arg0: string): any {
    throw new Error('Method not implemented.');
  }
}

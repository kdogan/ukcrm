import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersDialogComponent } from './customers-dialog.component';

describe('CustomersDialogComponent', () => {
  let component: CustomersDialogComponent;
  let fixture: ComponentFixture<CustomersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

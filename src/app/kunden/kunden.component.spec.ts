import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KundenComponent } from './kunden.component';

describe('KundenComponent', () => {
  let component: KundenComponent;
  let fixture: ComponentFixture<KundenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KundenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KundenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucherComponent } from './sucher.component';

describe('SucherComponent', () => {
  let component: SucherComponent;
  let fixture: ComponentFixture<SucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VertragComponent } from './vertrag.component';

describe('VertragComponent', () => {
  let component: VertragComponent;
  let fixture: ComponentFixture<VertragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VertragComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VertragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

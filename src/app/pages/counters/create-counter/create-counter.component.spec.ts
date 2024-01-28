import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCounterComponent } from './create-counter.component';

describe('CreateCounterComponent', () => {
  let component: CreateCounterComponent;
  let fixture: ComponentFixture<CreateCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCounterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

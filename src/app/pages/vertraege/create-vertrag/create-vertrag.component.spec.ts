import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVertragComponent } from './create-vertrag.component';

describe('CreateVertragComponent', () => {
  let component: CreateVertragComponent;
  let fixture: ComponentFixture<CreateVertragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateVertragComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateVertragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

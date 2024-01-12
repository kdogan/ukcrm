import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllVertraegeComponent } from './all-vertraege.component';

describe('AllVertraegeComponent', () => {
  let component: AllVertraegeComponent;
  let fixture: ComponentFixture<AllVertraegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllVertraegeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllVertraegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

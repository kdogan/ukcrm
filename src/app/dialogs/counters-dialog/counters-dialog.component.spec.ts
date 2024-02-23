import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountersDialogComponent } from './counters-dialog.component';

describe('CountersDialogComponent', () => {
  let component: CountersDialogComponent;
  let fixture: ComponentFixture<CountersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CountersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

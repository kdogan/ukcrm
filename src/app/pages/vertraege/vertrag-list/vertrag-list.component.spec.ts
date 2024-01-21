import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VertragListComponent } from './vertrag-list.component';

describe('VertragListComponent', () => {
  let component: VertragListComponent;
  let fixture: ComponentFixture<VertragListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VertragListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VertragListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

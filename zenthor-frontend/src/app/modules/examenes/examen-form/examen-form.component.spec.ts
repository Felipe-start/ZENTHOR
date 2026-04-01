import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenFormComponent } from './examen-form.component';

describe('ExamenFormComponent', () => {
  let component: ExamenFormComponent;
  let fixture: ComponentFixture<ExamenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamenFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

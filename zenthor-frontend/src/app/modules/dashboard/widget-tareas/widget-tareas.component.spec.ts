import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetTareasComponent } from './widget-tareas.component';

describe('WidgetTareasComponent', () => {
  let component: WidgetTareasComponent;
  let fixture: ComponentFixture<WidgetTareasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetTareasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetTareasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

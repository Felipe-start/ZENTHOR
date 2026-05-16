import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetIaComponent } from './widget-ia.component';

describe('WidgetIaComponent', () => {
  let component: WidgetIaComponent;
  let fixture: ComponentFixture<WidgetIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetIaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetIaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

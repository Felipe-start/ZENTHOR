import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetExamenesComponent } from './widget-examenes.component';

describe('WidgetExamenesComponent', () => {
  let component: WidgetExamenesComponent;
  let fixture: ComponentFixture<WidgetExamenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetExamenesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetExamenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConexionesComponent } from './conexiones.component';

describe('ConexionesComponent', () => {
  let component: ConexionesComponent;
  let fixture: ComponentFixture<ConexionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConexionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

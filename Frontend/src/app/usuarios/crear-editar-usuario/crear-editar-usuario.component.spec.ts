import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEditarUsuarioComponent } from './crear-editar-usuario.component';

describe('CrearEditarUsuarioComponent', () => {
  let component: CrearEditarUsuarioComponent;
  let fixture: ComponentFixture<CrearEditarUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearEditarUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearEditarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

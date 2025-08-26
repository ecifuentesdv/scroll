import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEditarWebviewComponent } from './crear-editar-webview.component';

describe('CrearEditarWebviewComponent', () => {
  let component: CrearEditarWebviewComponent;
  let fixture: ComponentFixture<CrearEditarWebviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearEditarWebviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearEditarWebviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

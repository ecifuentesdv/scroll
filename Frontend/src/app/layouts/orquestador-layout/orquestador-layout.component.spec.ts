import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrquestadorLayoutComponent } from './orquestador-layout.component';

describe('OrquestadorLayoutComponent', () => {
  let component: OrquestadorLayoutComponent;
  let fixture: ComponentFixture<OrquestadorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrquestadorLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrquestadorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

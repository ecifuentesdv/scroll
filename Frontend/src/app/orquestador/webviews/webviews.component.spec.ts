import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebviewsComponent } from './webviews.component';

describe('WebviewsComponent', () => {
  let component: WebviewsComponent;
  let fixture: ComponentFixture<WebviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebviewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

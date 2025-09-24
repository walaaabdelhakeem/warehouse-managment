import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsViewComponent } from './operations-view.component';

describe('OperationsViewComponent', () => {
  let component: OperationsViewComponent;
  let fixture: ComponentFixture<OperationsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

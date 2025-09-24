import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningBalancesComponent } from './opening-balances.component';

describe('OpeningBalancesComponent', () => {
  let component: OpeningBalancesComponent;
  let fixture: ComponentFixture<OpeningBalancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningBalancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

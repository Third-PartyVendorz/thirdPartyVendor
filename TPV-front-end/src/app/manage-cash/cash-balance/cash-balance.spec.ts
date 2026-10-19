import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashBalance } from './cash-balance';

describe('CashBalance', () => {
  let component: CashBalance;
  let fixture: ComponentFixture<CashBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashBalance],
    }).compileComponents();

    fixture = TestBed.createComponent(CashBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

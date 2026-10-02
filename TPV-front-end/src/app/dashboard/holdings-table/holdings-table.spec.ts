import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoldingsTable } from './holdings-table';

describe('HoldingsTable', () => {
  let component: HoldingsTable;
  let fixture: ComponentFixture<HoldingsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageCash } from './manage-cash';

describe('ManageCash', () => {
  let component: ManageCash;
  let fixture: ComponentFixture<ManageCash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCash],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

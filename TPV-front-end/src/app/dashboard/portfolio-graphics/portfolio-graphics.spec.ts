import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioGraphics } from './portfolio-graphics';

describe('PortfolioGraphics', () => {
  let component: PortfolioGraphics;
  let fixture: ComponentFixture<PortfolioGraphics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioGraphics],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioGraphics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

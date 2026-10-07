import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSliderComponent } from './custom-slider';

describe('CustomSlider', () => {
  let component: CustomSliderComponent;
  let fixture: ComponentFixture<CustomSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSliderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

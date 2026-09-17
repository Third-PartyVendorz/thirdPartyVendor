import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationPage } from './registration-page';

describe('RegistrationPage', () => {
  let component: RegistrationPage;
  let fixture: ComponentFixture<RegistrationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

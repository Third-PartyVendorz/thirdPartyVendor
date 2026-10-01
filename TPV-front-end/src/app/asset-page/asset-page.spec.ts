import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetPage } from './asset-page';

describe('AssetPage', () => {
  let component: AssetPage;
  let fixture: ComponentFixture<AssetPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
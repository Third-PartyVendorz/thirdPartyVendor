import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetResultComponent } from './asset-result';

describe('AssetResultComponent', () => {
	let component: AssetResultComponent;
	let fixture: ComponentFixture<AssetResultComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AssetResultComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(AssetResultComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

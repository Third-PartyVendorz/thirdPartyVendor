import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetsPage } from './assets-page';

describe('AssetsPage', () => {
	let component: AssetsPage;
	let fixture: ComponentFixture<AssetsPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AssetsPage],
		}).compileComponents();

		fixture = TestBed.createComponent(AssetsPage);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
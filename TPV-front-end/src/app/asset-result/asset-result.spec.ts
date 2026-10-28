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

	it('shows the nearest candle when hovering over the chart', () => {
		const today = new Date().toISOString().slice(0, 10);
		const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		component.candles.set([
			{ date: yesterday, open: 10, high: 12, low: 9, close: 11, adjclose: 11, volume: 100, synthetic: false },
			{ date: today, open: 12, high: 14, low: 11, close: 13, adjclose: 13, volume: 120, synthetic: false },
		]);
		const event = {
			clientX: 80,
			currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
		} as unknown as PointerEvent;

		component.onChartPointerMove(event);

		expect(component.hoveredCandle?.date).toBe(today);
		expect(component.chartHoverXPercent).toBe(100);
	});
});

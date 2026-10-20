import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ForexContainer } from './forex-container';

describe('ForexContainer', () => {
  let component: ForexContainer;
  let fixture: ComponentFixture<ForexContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForexContainer],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForexContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });});

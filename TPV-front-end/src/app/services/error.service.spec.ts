import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    errorService = TestBed.inject(ErrorService);
    errorService.clearErrorMessage();
  });

  it('should store and clear error messages', () => {
    expect(errorService.errorMessage()).toBeNull();

    errorService.setErrorMessage('Something went wrong');
    expect(errorService.errorMessage()).toBe('Something went wrong');

    errorService.clearErrorMessage();
    expect(errorService.errorMessage()).toBeNull();
  });
});
import { TestBed } from '@angular/core/testing';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    messageService = TestBed.inject(MessageService);
    messageService.clearMessage();
  });

  it('should store and clear messages', () => {
    expect(messageService.message()).toBeNull();

    messageService.setErrorMessage('Something went wrong');
    expect(messageService.message()).toEqual({ type: 'error', text: 'Something went wrong' });

    messageService.setSuccessMessage('Done');
    expect(messageService.message()).toEqual({ type: 'success', text: 'Done' });

    messageService.clearMessage();
    expect(messageService.message()).toBeNull();
  });
});
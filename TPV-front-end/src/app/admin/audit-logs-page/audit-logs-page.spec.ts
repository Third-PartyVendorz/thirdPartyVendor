import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuditLogsPage } from './audit-logs-page';
import { AuditEventResponse } from '../../services/audit.service';
import { MessageService } from '../../services/message.service';
import { environment } from '../../../environments/environment.local';

describe('AuditLogsPage', () => {
  let fixture: ComponentFixture<AuditLogsPage>;
  let component: AuditLogsPage;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/admin/audit`;
  const client = { id: 7, name: 'Jane Smith', email: 'jane@example.com' };
  const event: AuditEventResponse = {
    id: '12', type: 'Trade', action: 'Trade completed', client: client.name, clientId: client.id,
    reference: '12', instrument: 'AAPL', status: 'Completed', timestamp: '2026-10-28T12:00:00',
    actor: 'Execution service', summary: '2 AAPL executed for the client.',
    details: ['Related order: 11'], pricing: 'Execution price: 120.00 USD', impact: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditLogsPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
  });

  it('starts with client search and shows distinct email-labelled client matches', () => {
    expect(component.searchMode).toBe('client');
    component.clientSearch = ' Jane ';
    component.searchClients();
    const request = http.expectOne(request => request.url === `${baseUrl}/clients`);
    expect(request.request.params.get('search')).toBe('Jane');
    request.flush({ items: [client], total: 1, page: 0, pageSize: 20 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(client.email);
    expect(fixture.nativeElement.textContent).toContain('View activity');
  });

  it('loads the selected client activity and retains the detailed record view', () => {
    component.selectClient(client);
    const request = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(request.request.params.get('type')).toBe('');
    expect(request.request.params.has('from')).toBe(false);
    request.flush({ items: [event], total: 1, page: 0, pageSize: 20 });
    fixture.detectChanges();
    const recordButton: HTMLButtonElement = fixture.nativeElement.querySelector('.record-link');
    recordButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detail-panel').textContent).toContain(event.pricing);
    expect(component.eventTotal).toBe(1);
  });

  it('sends date, type and asset filters and paginates using the applied filters', () => {
    component.selectedClient = client;
    component.filters = { type: 'Forex exchange', from: '2026-10-01', to: '2026-10-28', instrument: ' USD/EUR ' };
    component.applyFilters();
    const first = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(first.request.params.get('type')).toBe('forex');
    expect(first.request.params.get('from')).toBe('2026-10-01');
    expect(first.request.params.get('to')).toBe('2026-10-28');
    expect(first.request.params.get('instrument')).toBe('USD/EUR');
    first.flush({ items: [], total: 21, page: 0, pageSize: 20 });

    component.filters.instrument = 'AAPL';
    component.loadActivity(1);
    const second = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(second.request.params.get('page')).toBe('1');
    expect(second.request.params.get('instrument')).toBe('USD/EUR');
    second.flush({ items: [], total: 21, page: 1, pageSize: 20 });
    expect(component.eventPage).toBe(1);
  });

  it('preserves transaction-ID lookup', () => {
    component.setMode('id');
    component.searchInput = '12';
    component.search();
    http.expectOne(`${baseUrl}/trade/12`).flush(event);
    expect(component.selectedEvent).toEqual(event);
    expect(component.events).toEqual([event]);
  });

  it('rejects empty client searches and reversed date ranges without making requests', () => {
    component.searchClients();
    expect(TestBed.inject(MessageService).message()?.text).toContain('client name or email');
    component.selectedClient = client;
    component.filters.from = '2026-10-29';
    component.filters.to = '2026-10-28';
    component.applyFilters();
    expect(TestBed.inject(MessageService).message()?.text).toContain('Start date');
    http.expectNone(request => request.url.startsWith(baseUrl));
  });

  it('cancels pending searches when switching modes and clears stale records', () => {
    component.clientSearch = 'Jane';
    component.searchClients();
    const request = http.expectOne(request => request.url === `${baseUrl}/clients`);
    component.setMode('id');
    expect(request.cancelled).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(component.selectedClient).toBeNull();
    expect(component.events).toEqual([]);
  });

  it('shows an empty state and recovers after a failed request', () => {
    component.selectClient(client);
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ message: 'Audit unavailable' }, { status: 500, statusText: 'Server error' });
    expect(component.isLoading).toBe(false);
    expect(TestBed.inject(MessageService).message()?.text).toBe('Audit unavailable');
    component.applyFilters();
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ items: [], total: 0, page: 0, pageSize: 20 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No activity matches these filters.');
  });
});
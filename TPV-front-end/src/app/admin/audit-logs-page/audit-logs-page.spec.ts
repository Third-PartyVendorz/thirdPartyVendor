import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuditLogsPage } from './audit-logs-page';
import { AuditEventResponse } from '../../services/audit.service';
import { MessageService } from '../../services/message.service';
import { environment } from '../../../environments/environment.local';
import { vi } from 'vitest';

describe('AuditLogsPage', () => {
  let fixture: ComponentFixture<AuditLogsPage>;
  let component: AuditLogsPage;
  let http: HttpTestingController;
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
  const baseUrl = `${environment.apiBaseUrl}/admin/audit`;
  const client = { id: 7, name: 'Jane Smith', email: 'jane@example.com' };
  const event: AuditEventResponse = {
    id: '12', type: 'Trade', action: 'Trade completed', client: client.name, clientId: client.id,
    reference: '12', instrument: 'AAPL', status: 'Completed', timestamp: '2026-10-28T12:00:00',
    actor: 'Execution service', summary: '2 AAPL executed for the client.',
    details: ['Related order: 11'], pricing: 'Execution price: 120.00 USD', impact: '',
  };

  beforeEach(async () => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
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
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
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

  it('does not request activity until filters are explicitly applied', () => {
    http.expectNone(request => request.url.includes('/events'));
    component.selectClient(client);
    component.loadActivity();
    fixture.detectChanges();

    http.expectNone(request => request.url.includes('/events'));
    expect(component.events).toEqual([]);
    expect(component.hasSearch).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('No filters applied.');

    component.filters.instrument = 'AAPL';
    fixture.detectChanges();
    http.expectNone(request => request.url.includes('/events'));
  });

  it('loads activity after applying filters and retains the detailed record view', () => {
    component.selectClient(client);
    component.applyFilters();
    const request = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(request.request.params.get('type')).toBe('');
    expect(request.request.params.has('from')).toBe(false);
    request.flush({ items: [event], total: 1, page: 0, pageSize: 5 });
    fixture.detectChanges();
    const recordButton: HTMLButtonElement = fixture.nativeElement.querySelector('.record-link');
    recordButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detail-panel').textContent).toContain(event.pricing);
    expect(component.eventTotal).toBe(1);
  });

  it('scrolls to the rendered details on first and subsequent transaction selections', async () => {
    component.selectClient(client);
    component.events = [event];
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.record-link').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const panel: HTMLElement = fixture.nativeElement.querySelector('.detail-panel');
    expect(panel).not.toBeNull();
    expect(panel.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    fixture.nativeElement.querySelector('.results-panel tbody tr').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(panel.scrollIntoView).toHaveBeenCalledTimes(2);
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
    first.flush({ items: [], total: 6, page: 0, pageSize: 5 });

    component.filters.instrument = 'AAPL';
    component.loadActivity(1);
    const second = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(second.request.params.get('page')).toBe('1');
    expect(second.request.params.get('instrument')).toBe('USD/EUR');
    second.flush({ items: [], total: 6, page: 1, pageSize: 5 });
    expect(component.eventPage).toBe(1);
  });

  it('clears activity filters and records without reloading or clearing the client search', () => {
    component.selectedClient = client;
    component.clientSearch = 'Jane';
    component.submittedClientSearch = 'Jane';
    component.clients = [client];
    component.filters = { type: 'Trade', from: '2026-10-01', to: '2026-10-28', instrument: 'AAPL' };
    component.applyFilters();
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ items: [event], total: 6, page: 0, pageSize: 5 });
    component.loadActivity(1);
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ items: [event], total: 6, page: 1, pageSize: 5 });
    component.selectEvent(event);
    fixture.detectChanges();

    const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.filter-actions button[type="button"]');
    clearButton.click();

    http.expectNone(request => request.url.includes('/events'));
    expect(component.filters).toEqual({ type: '', from: '', to: '', instrument: '' });
    expect(component.selectedClient).toEqual(client);
    expect(component.clientSearch).toBe('Jane');
    expect(component.submittedClientSearch).toBe('Jane');
    expect(component.clients).toEqual([client]);
    expect(component.selectedEvent).toBeNull();
    expect(component.events).toEqual([]);
    expect(component.eventTotal).toBe(0);
    expect(component.hasAppliedFilters).toBe(false);
    expect(component.eventPage).toBe(0);
    component.loadActivity(1);
    http.expectNone(request => request.url.includes('/events'));
  });

  it('shows five activity records per page and keeps older records accessible', () => {
    component.selectClient(client);
    component.applyFilters();
    const records = Array.from({ length: 5 }, (_, index) => ({ ...event, id: String(index + 1) }));
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ items: records, total: 6, page: 0, pageSize: 5 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.results-panel tbody tr').length).toBe(5);
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector('nav[aria-label="Activity pages"] button:last-child');
    expect(nextButton.disabled).toBe(false);
    nextButton.click();
    const request = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);
    expect(request.request.params.get('page')).toBe('1');
    request.flush({ items: [event], total: 6, page: 1, pageSize: 5 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.results-panel tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('nav[aria-label="Activity pages"] button:last-child').disabled).toBe(true);
  });

  it('cancels pending activity and clears stale records when selecting another client', () => {
    component.selectClient(client);
    component.applyFilters();
    const request = http.expectOne(request => request.url === `${baseUrl}/clients/7/events`);

    component.selectClient({ ...client, id: 8 });

    expect(request.cancelled).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(component.hasAppliedFilters).toBe(false);
    expect(component.selectedClient?.id).toBe(8);
    expect(component.events).toEqual([]);
    http.expectNone(request => request.url.includes('/events'));
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
    component.applyFilters();
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ message: 'Audit unavailable' }, { status: 500, statusText: 'Server error' });
    expect(component.isLoading).toBe(false);
    expect(TestBed.inject(MessageService).message()?.text).toBe('Audit unavailable');
    component.applyFilters();
    http.expectOne(request => request.url === `${baseUrl}/clients/7/events`)
      .flush({ items: [], total: 0, page: 0, pageSize: 5 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No activity matches these filters.');
  });
});
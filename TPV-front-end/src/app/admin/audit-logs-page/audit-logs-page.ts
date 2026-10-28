import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Observable, Subscription } from 'rxjs';
import { AuditClientResponse, AuditEventResponse, AuditEventType, AuditFilters, AuditService } from '../../services/audit.service';
import { MessageService } from '../../services/message.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-audit-logs-page',
  templateUrl: './audit-logs-page.html',
  styleUrl: './audit-logs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsPage implements OnDestroy {
  searchMode: 'client' | 'id' = 'client';
  clientSearch = '';
  submittedClientSearch = '';
  clients: AuditClientResponse[] = [];
  selectedClient: AuditClientResponse | null = null;
  clientPage = 0;
  clientTotal = 0;
  eventPage = 0;
  eventTotal = 0;
  readonly pageSize = 20;
  filters: AuditFilters = { type: '', from: '', to: '', instrument: '' };
  private appliedFilters: AuditFilters = { ...this.filters };
  private activeRequest?: Subscription;
  searchInput = '';
  selectedType: AuditEventType = 'Trade';
  submittedSearchTerm = '';
  submittedType: AuditEventType | '' = '';
  selectedEvent: AuditEventResponse | null = null;
  isLoading = false;
  events: AuditEventResponse[] = [];

  readonly eventTypes: AuditEventType[] = ['Trade', 'Order', 'Forex exchange'];

  constructor(
    private auditService: AuditService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  get filteredEvents(): AuditEventResponse[] {
    return this.events;
  }

  get hasSearch(): boolean {
    return this.selectedClient !== null || this.submittedSearchTerm.trim().length > 0;
  }

  setMode(mode: 'client' | 'id'): void {
    this.clearFilters();
    this.searchMode = mode;
  }

  searchClients(page = 0): void {
    const query = page === 0 ? this.clientSearch.trim() : this.submittedClientSearch;
    if (!query) {
      this.messageService.setErrorMessage('Enter a client name or email.');
      return;
    }
    this.selectedClient = null;
    this.selectedEvent = null;
    this.events = [];
    this.eventTotal = 0;
    this.clients = [];
    this.clientTotal = 0;
    this.submittedClientSearch = query;
    this.request(this.auditService.searchClients(query, page), (result) => {
      this.clients = result.items;
      this.clientTotal = result.total;
      this.clientPage = result.page;
    });
  }

  selectClient(client: AuditClientResponse): void {
    this.selectedClient = client;
    this.filters = { type: '', from: '', to: '', instrument: '' };
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.filters.from && this.filters.to && this.filters.from > this.filters.to) {
      this.messageService.setErrorMessage('Start date must not be after end date.');
      return;
    }
    this.appliedFilters = { ...this.filters, instrument: this.filters.instrument.trim() };
    this.loadActivity();
  }

  loadActivity(page = 0): void {
    if (!this.selectedClient) return;
    this.selectedEvent = null;
    this.events = [];
    this.eventTotal = 0;
    this.request(this.auditService.searchEvents(this.selectedClient.id, this.appliedFilters, page), (result) => {
      this.events = result.items;
      this.eventTotal = result.total;
      this.eventPage = result.page;
    });
  }

  search(): void {
    const id = this.searchInput.trim();
    if (!id) {
      this.messageService.setErrorMessage('Enter an ID to search.');
      return;
    }

    this.submittedSearchTerm = id;
    this.submittedType = this.selectedType;
    this.selectedEvent = null;
    this.events = [];
    this.eventTotal = 0;
    this.request(this.auditService.findEvent(this.selectedType, id), (event) => {
      this.events = [event];
      this.eventTotal = 1;
      this.selectedEvent = event;
    });
  }

  private request<T>(source: Observable<T>, onSuccess: (value: T) => void): void {
    this.activeRequest?.unsubscribe();
    this.isLoading = true;
    this.activeRequest = source
      .pipe(finalize(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: (result) => {
          onSuccess(result);
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to load audit records.');
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  selectEvent(event: AuditEventResponse): void {
    this.selectedEvent = event;
  }

  clearFilters(): void {
    this.activeRequest?.unsubscribe();
    this.clientSearch = '';
    this.submittedClientSearch = '';
    this.clients = [];
    this.selectedClient = null;
    this.clientPage = 0;
    this.clientTotal = 0;
    this.eventPage = 0;
    this.eventTotal = 0;
    this.filters = { type: '', from: '', to: '', instrument: '' };
    this.searchInput = '';
    this.selectedType = 'Trade';
    this.submittedSearchTerm = '';
    this.submittedType = '';
    this.selectedEvent = null;
    this.events = [];
  }

  ngOnDestroy(): void {
    this.activeRequest?.unsubscribe();
  }

  formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
    }).format(new Date(timestamp));
  }
}

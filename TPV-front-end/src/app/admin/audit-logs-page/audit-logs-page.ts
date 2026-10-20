import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuditEventResponse, AuditEventType, AuditService } from '../../services/audit.service';
import { MessageService } from '../../services/message.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-audit-logs-page',
  templateUrl: './audit-logs-page.html',
  styleUrl: './audit-logs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsPage {
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
    return this.submittedSearchTerm.trim().length > 0;
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
    this.isLoading = true;

    this.auditService.findEvent(this.selectedType, id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: (event) => {
          this.events = [event];
          this.selectedEvent = event;
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to find this audit record.');
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  selectEvent(event: AuditEventResponse): void {
    this.selectedEvent = event;
  }

  clearFilters(): void {
    this.searchInput = '';
    this.selectedType = 'Trade';
    this.submittedSearchTerm = '';
    this.submittedType = '';
    this.selectedEvent = null;
    this.events = [];
  }

  formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
    }).format(new Date(timestamp));
  }
}

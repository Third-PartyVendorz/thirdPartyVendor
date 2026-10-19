import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-audit-logs-page',
  templateUrl: './audit-logs-page.html',
  styleUrl: './audit-logs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsPage {
}

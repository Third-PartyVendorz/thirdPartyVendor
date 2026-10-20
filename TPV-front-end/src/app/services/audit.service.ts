import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';

export type AuditEventType = 'Order' | 'Trade' | 'Forex exchange';

export interface AuditEventResponse {
  id: string;
  type: AuditEventType;
  action: string;
  client: string;
  clientId: number;
  reference: string;
  instrument: string;
  status: string;
  timestamp: string;
  actor: string;
  summary: string;
  details: string[];
  pricing: string;
  impact: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  findEvent(type: AuditEventType, id: string): Observable<AuditEventResponse> {
    const eventType = type === 'Forex exchange' ? 'forex' : type.toLowerCase();
    return this.http.get<AuditEventResponse>(`${environment.apiBaseUrl}/admin/audit/${eventType}/${id}`);
  }
}
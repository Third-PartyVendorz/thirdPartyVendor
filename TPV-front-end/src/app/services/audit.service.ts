import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';

export type AuditEventType = 'Order' | 'Trade' | 'Forex exchange';

export interface AuditClientResponse {
  id: number;
  name: string;
  email: string;
}

export interface AuditPageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditFilters {
  type: AuditEventType | '';
  from: string;
  to: string;
  instrument: string;
}

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

  searchClients(search: string, page = 0): Observable<AuditPageResponse<AuditClientResponse>> {
    const params = new HttpParams().set('search', search).set('page', page);
    return this.http.get<AuditPageResponse<AuditClientResponse>>(
      `${environment.apiBaseUrl}/admin/audit/clients`, { params });
  }

  searchEvents(clientId: number, filters: AuditFilters, page = 0): Observable<AuditPageResponse<AuditEventResponse>> {
    let params = new HttpParams().set('page', page).set('instrument', filters.instrument)
      .set('type', filters.type === 'Forex exchange' ? 'forex' : filters.type.toLowerCase());
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<AuditPageResponse<AuditEventResponse>>(
      `${environment.apiBaseUrl}/admin/audit/clients/${clientId}/events`, { params });
  }

  findEvent(type: AuditEventType, id: string): Observable<AuditEventResponse> {
    const eventType = type === 'Forex exchange' ? 'forex' : type.toLowerCase();
    return this.http.get<AuditEventResponse>(`${environment.apiBaseUrl}/admin/audit/${eventType}/${id}`);
  }
}
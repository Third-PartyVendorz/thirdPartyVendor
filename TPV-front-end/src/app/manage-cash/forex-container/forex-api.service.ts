import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.local';
import { ForexRequest } from '../../dto/ForexRequest';
import { ForexResponse } from '../../dto/ForexResponse';

@Injectable({
  providedIn: 'root',
})
export class ForexApiService {
  constructor(private readonly http: HttpClient) {}

  submitExchange(request: ForexRequest): Observable<ForexResponse> {
    return this.http.post<ForexResponse>(`${environment.apiBaseUrl}/forex`, request);
  }
}
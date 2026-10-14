import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { OrderResponse } from '../dto/OrderResponse';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	constructor(private http: HttpClient) {}

	fetchOrders(): Observable<OrderResponse[]> {
		return this.http.get<OrderResponse[]>(`${environment.apiBaseUrl}/orders`);
	}

	cancelOrder(orderId: number): Observable<OrderResponse> {
		return this.http.patch<OrderResponse>(`${environment.apiBaseUrl}/orders/${orderId}`, {});
	}
}
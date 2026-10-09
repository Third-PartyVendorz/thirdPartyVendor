import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import { CashHoldingResponse } from "../dto/CashHoldingResponse";
import { environment } from "../../environments/environment.local";
import { HoldingResponse } from "../dto/HoldingResponse";
import { OrderRequest } from "../dto/OrderRequest";
import { OrderResponse } from "../dto/OrderResponse";


@Injectable({
  providedIn: 'root'
})
export class TradeService {
  constructor(private http: HttpClient) { }

  getCashHoldingByCurrencyCode(currencyCode: string): Observable<CashHoldingResponse> {
    return this.http.get<CashHoldingResponse>(`${environment.apiBaseUrl}/cashHoldings/${currencyCode}`);
  }

  getQuantitySharesOwned(symbol: string): Observable<HoldingResponse> {
    // return this.http.get<HoldingResponse>(`${environment.apiBaseUrl}/holdings/${symbol}`);

    return of(
      {
        assetId: 5,
        security: "Apple Inc.",
        ticker: "AAPL",
        assetType: "equity",
        numShares: 20 
      } as HoldingResponse
    );
  }

  postOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    // TODO: Uncomment below to use real API
    // return this.http.post<OrderResponse>(`${environment.apiBaseUrl}/order`, orderRequest);

    // Mock successful order submission - simulates 2 second network delay
    // return of(
    //   {
    //     orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    //     symbol: orderRequest.symbol,
    //     side: orderRequest.side,
    //     quantity: orderRequest.quantity,
    //     price: orderRequest.price,
    //     status: 'SUBMITTED',
    //     timestamp: new Date().toISOString()
    //   } as OrderResponse
    // ).pipe(
    //   delay(2000) // Simulate 2 second network delay
    // );
    return this.http.post<OrderResponse>(`${environment.apiBaseUrl}/orders`, orderRequest);
  }

  postOrderError(orderRequest: OrderRequest): Observable<OrderResponse> {
    return of(
      {
        orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        status: 'FAILED',
        timestamp: new Date().toISOString()
      } as OrderResponse
    ).pipe(
      delay(2000),
      switchMap(() => throwError(() => new Error('Order submission failed: Insufficient liquidity')))
    );
  }
}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import { CashHoldingResponse } from "../dto/CashHoldingResponse";
import { CashTransactionRequest } from "../dto/CashTransactionRequest";
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

  postCashTransaction(request: CashTransactionRequest): Observable<CashHoldingResponse> {
    return this.http.post<CashHoldingResponse>(`${environment.apiBaseUrl}/cashHoldings`, request);
  }

  getQuantitySharesOwned(symbol: string): Observable<HoldingResponse> {
    return this.http.get<HoldingResponse>(`${environment.apiBaseUrl}/holdings/${symbol}`);
  }

  postOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${environment.apiBaseUrl}/orders`, orderRequest);
  }
}
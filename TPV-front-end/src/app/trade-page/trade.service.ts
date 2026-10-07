import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CashHoldingResponse } from "../dto/CashHoldingResponse";
import { environment } from "../../environments/environment.local";


@Injectable({
  providedIn: 'root'
})
export class TradeService {
  constructor(private http: HttpClient) { }

  getCashHoldingByCurrencyCode(currencyCode: string): Observable<CashHoldingResponse> {
    console.log(environment.apiBaseUrl)
    return this.http.get<CashHoldingResponse>(`${environment.apiBaseUrl}/cashHoldings/${currencyCode}`);
  }
}
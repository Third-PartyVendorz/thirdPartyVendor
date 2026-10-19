import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment.local";



@Injectable({
  providedIn: 'root'
})
export class TradeService {
  constructor(private http: HttpClient) { }

}
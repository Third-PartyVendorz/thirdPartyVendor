import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.local';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-home-page',
  styleUrl: './home-page.scss',
  templateUrl: './home-page.html',
})
export class HomePage {
  isTesting = false;
  testStatus = 'Click the button below to test a protected API request.';
  testResult = '';

  constructor(private http: HttpClient) {}

  testProtectedRequest() {
    this.isTesting = true;
    this.testStatus = 'Testing protected API request...';
    this.testResult = '';

    this.http.get<unknown[]>(`${environment.apiBaseUrl}/cashHoldings`).subscribe({
      next: (cashHoldings) => {
        this.isTesting = false;
        this.testStatus = 'Protected request succeeded.';
        this.testResult = `Refresh-and-retry worked. The endpoint returned ${cashHoldings.length} cash holding record(s).`;
      },
      error: (error) => {
        this.isTesting = false;
        this.testStatus = 'Protected request failed.';
        this.testResult = error?.error?.message ?? 'Check the browser console and network tab.';
      },
    });
  }
}


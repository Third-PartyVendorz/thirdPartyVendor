import { Component, signal } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { MessageService } from './services/message.service';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnDestroy{

  private routerSubscription: Subscription;
  
  constructor(public messageService: MessageService, private router: Router, private authService: AuthService) {
    this.routerSubscription = this.router.events.subscribe( event => {
      if (event instanceof NavigationStart) {
        const isBrowserRefresh = ! this.router.navigated;

        if (isBrowserRefresh) {
          this.handleBrowserRefresh();
        }
      }
    });
  }

  protected readonly title = signal('TPV-front-end');

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private handleBrowserRefresh() {
    console.log('Handling browser refresh');
    this.authService.checkSession();
  }
}

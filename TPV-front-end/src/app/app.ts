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
export class App{

  
  constructor(public messageService: MessageService) {
  }

  protected readonly title = signal('TPV-front-end');

}

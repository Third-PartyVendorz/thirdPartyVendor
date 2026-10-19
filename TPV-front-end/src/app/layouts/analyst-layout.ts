import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalystNavbar } from '../analyst/analyst-navbar/analyst-navbar';

@Component({
    standalone: true,
    imports: [RouterOutlet, AnalystNavbar],
    selector: 'app-analyst-layout',
    template: `
        <app-analyst-navbar></app-analyst-navbar>
        <router-outlet></router-outlet>
    `,
    styleUrl: './analyst-layout.scss',
})
export class AnalystLayoutComponent{}
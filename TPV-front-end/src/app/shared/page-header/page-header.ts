import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './page-header.html',
    styleUrl: './page-header.scss',
})
export class PageHeader {
    @Input() eyebrow = '';
    @Input() title = '';
    @Input() description = '';
}
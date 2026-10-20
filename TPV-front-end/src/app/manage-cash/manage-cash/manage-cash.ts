import { Component } from '@angular/core';
import { ForexContainer } from '../forex-container/forex-container';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  imports: [ForexContainer, PageHeader],
  selector: 'app-manage-cash',
  styleUrl: './manage-cash.scss',
  templateUrl: './manage-cash.html',
})
export class ManageCash {}

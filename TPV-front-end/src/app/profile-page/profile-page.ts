import { Component, OnInit } from '@angular/core';
import { UserContextService } from '../services/user-context.service';
import { UserContext } from '../dto/UserContext';

@Component({
	standalone: true,
	selector: 'app-profile-page',
	styleUrl: './profile-page.scss',
	templateUrl: './profile-page.html',
})
export class ProfilePage implements OnInit {
	constructor(private userContextService: UserContextService) {}

	userContext: UserContext | null = null;

	ngOnInit(): void {
		this.loadUserContext();
	}

	loadUserContext(): void {
		this.userContext = this.userContextService.getUserContext();
	}


}
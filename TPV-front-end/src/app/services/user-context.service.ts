import { Injectable } from '@angular/core';
import { UserContext } from '../dto/UserContext';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  constructor() { }

  getUserContext() {
    return JSON.parse(localStorage.getItem('userContext') || '{}');
  }

  setUserContext(userContext: UserContext) {
    localStorage.setItem('userContext', JSON.stringify(userContext));
  }
}
import { Injectable } from '@angular/core';
import { UserContext } from '../dto/UserContext';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  constructor() { }

  getUserContext(): UserContext | null {
    const storedUserContext = localStorage.getItem('userContext');

    if (!storedUserContext) {
      return null;
    }

    try {
      const parsedUserContext = JSON.parse(storedUserContext) as Partial<UserContext>;

      if (!parsedUserContext.firstName || !parsedUserContext.lastName || !parsedUserContext.phoneNumber || !parsedUserContext.email || !parsedUserContext.dateOfBirth) {
        return null;
      }

      return {
        firstName: parsedUserContext.firstName,
        lastName: parsedUserContext.lastName,
        phoneNumber: parsedUserContext.phoneNumber,
        email: parsedUserContext.email,
        dateOfBirth: new Date(parsedUserContext.dateOfBirth),
      };
    } catch {
      return null;
    }
  }

  setUserContext(userContext: UserContext) {
    localStorage.setItem('userContext', JSON.stringify(userContext));
  }

  clearUserContext() {
    localStorage.removeItem('userContext');
  }
}
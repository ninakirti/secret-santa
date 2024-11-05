import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  chosen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 1, name: 'Alice', chosen: false },
    { id: 2, name: 'Bob', chosen: false },
    { id: 3, name: 'Lily', chosen: false },
    // Add all participants here
  ];

  private loggedInUser: User | null = null;

  constructor(private router: Router) {}

  login(name: string): boolean {
    const user = this.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
    if (user) {
      this.loggedInUser = user;
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  getLoggedInUser(): User | null {
    return this.loggedInUser;
  }

  getAvailableUsers(): User[] {
    return this.users.filter((u) => u !== this.loggedInUser && !u.chosen);
  }

  markUserAsChosen(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.chosen = true;
    }
  }
}

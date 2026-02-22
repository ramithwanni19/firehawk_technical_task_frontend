import { Injectable, inject } from '@angular/core';
import { Auth, user, signInWithEmailAndPassword, idToken } from '@angular/fire/auth'; 
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser$ = user(this.auth);
  private token: string | null = null;

  constructor() {
    // Keep the token updated automatically
    idToken(this.auth).subscribe(t => {
      this.token = t;
      console.log('Token updated');
    });
  }

  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/dashboard']); 
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Pass the error to the component to show a message
    }
  }

  async isLoggedIn(): Promise<boolean> {
    // Wait for the first emission of the user observable
    const u = await firstValueFrom(this.currentUser$);
    return !!u;
  }

  getToken() { 
    return this.token; 
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
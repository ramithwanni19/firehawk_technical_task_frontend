import { Injectable, inject } from '@angular/core';
import { Auth, user, signInWithEmailAndPassword, idToken, onAuthStateChanged } from '@angular/fire/auth'; 
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  currentUser$: Observable<any> = user(this.auth);
  private token: string | null = localStorage.getItem('auth_token'); 

  constructor() {
    idToken(this.auth).subscribe(async (t) => {
      this.token = t;
      if (t) {
        localStorage.setItem('auth_token', t);
      } else {
        localStorage.removeItem('auth_token');
      }
      console.log('Token sync complete');
    });
  }

  async login(email: string, pass: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
      const token = await userCredential.user.getIdToken();
      
      this.token = token;
      localStorage.setItem('auth_token', token);
      
      this.router.navigate(['/dashboard']); 
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error; 
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const u = await firstValueFrom(this.currentUser$);
    return !!u || !!localStorage.getItem('auth_token');
  }

  getToken() { 
    return this.token || localStorage.getItem('auth_token'); 
  }

  async logout() {
    await this.auth.signOut();
    this.token = null;
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
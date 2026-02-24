import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    this.errorMessage = '';

    try {
      const user = await this.authService.login(this.email, this.password);
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('Login failed', error);
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        this.errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many failed attempts. Try again later.';
      } else {
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    }
  }
}

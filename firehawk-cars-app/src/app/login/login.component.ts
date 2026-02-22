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
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // These variables match the [(ngModel)] names in your HTML
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  async onLogin() {
    this.errorMessage = ''; // Clear previous errors
    
    try {
      // Call the login method in your service
      await this.authService.login(this.email, this.password);
      
      // If successful, navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Handle Firebase errors (e.g., wrong password, user not found)
      console.error('Login failed', error);
      this.errorMessage = 'Invalid email or password. Please try again.';
    }
  }
}
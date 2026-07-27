import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  showPassword = false;
  isRegisterMode = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.email = '';
    this.password = '';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.snackbar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }
    this.loading = true;

    if (this.isRegisterMode) {
      this.auth.register({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.loading = false;
          this.snackbar.open('Account created! Please login.', 'Close', { duration: 3000 });
          this.isRegisterMode = false;
        },
        error: (err) => {
          this.loading = false;
          this.snackbar.open(err.error?.message || 'Registration failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.auth.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.loading = false;
          this.auth.saveToken(res.token, res.user);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.snackbar.open(err.error?.message || 'Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

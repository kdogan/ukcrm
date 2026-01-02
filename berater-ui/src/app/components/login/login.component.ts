import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface TestUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  isDevelopment = !environment.production;
  testUsers: TestUser[] = [];
  loadingTestUsers = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Test-User aus Datenbank laden (nur in Development)
    if (this.isDevelopment) {
      this.loadTestUsers();
    }
  }

  loadTestUsers(): void {
    this.loadingTestUsers = true;
    this.authService.getTestUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.testUsers = response.data;
          this.testUsers.forEach(tu => tu.password = "Start1234!");
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Test-User:', error);
        this.testUsers = [];
      },
      complete: () => {
        this.loadingTestUsers = false;
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.success) {
          // Wait a tick to ensure token is stored before navigation
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Anmeldung fehlgeschlagen';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fillTestUser(user: TestUser): void {
    this.loginForm.patchValue({
      email: user.email,
      password: user.password
    });
    this.error = '';
  }

  get f() {
    return this.loginForm.controls;
  }
}

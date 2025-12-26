import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const { firstName, lastName, email, phone, password } = this.registerForm.value;

    this.authService.register({ firstName, lastName, email, phone, password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = true;
          this.successMessage = response.message || 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.';
          this.registerForm.reset();
          this.loading = false;

          // Nach 3 Sekunden zum Login weiterleiten
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} ist erforderlich`;
      if (field.errors['email']) return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} muss mindestens ${field.errors['minlength'].requiredLength} Zeichen lang sein`;
      if (field.errors['passwordMismatch']) return 'Passwörter stimmen nicht überein';
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: any = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      phone: 'Telefon',
      password: 'Passwort',
      confirmPassword: 'Passwort wiederholen'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}

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

  // Mehrsprachige Texte für das Registrierungsformular
  translations: { [key: string]: { [key: string]: string } } = {
    de: {
      appTitle: 'Berater App',
      subtitle: 'Erstellen Sie Ihr Konto',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail-Adresse',
      phone: 'Telefon (optional)',
      language: 'Sprache / Dil',
      languageHint: 'E-Mails werden in der gewählten Sprache versendet.',
      password: 'Passwort',
      passwordPlaceholder: 'Mindestens 8 Zeichen',
      confirmPassword: 'Passwort wiederholen',
      privacyText: 'Ich habe die',
      privacyLink: 'Datenschutzerklärung',
      privacyAccept: 'gelesen und akzeptiere diese.',
      registerButton: 'Registrieren',
      registerLoading: 'Registrierung läuft...',
      loginPrompt: 'Haben Sie bereits ein Konto?',
      loginLink: 'Hier anmelden',
      successRedirect: 'Sie werden in Kürze zum Login weitergeleitet...',
      errorRequired: 'ist erforderlich',
      errorEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      errorMinLength: 'muss mindestens',
      errorMinLengthSuffix: 'Zeichen lang sein',
      errorPasswordMismatch: 'Passwörter stimmen nicht überein',
      errorPrivacy: 'Sie müssen die Datenschutzerklärung akzeptieren',
      errorGeneric: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    },
    tr: {
      appTitle: 'Danışman App',
      subtitle: 'Hesabınızı oluşturun',
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-posta adresi',
      phone: 'Telefon (isteğe bağlı)',
      language: 'Sprache / Dil',
      languageHint: 'E-postalar seçilen dilde gönderilecektir.',
      password: 'Şifre',
      passwordPlaceholder: 'En az 8 karakter',
      confirmPassword: 'Şifre tekrar',
      privacyText: '',
      privacyLink: 'Gizlilik politikasını',
      privacyAccept: 'okudum ve kabul ediyorum.',
      registerButton: 'Kayıt Ol',
      registerLoading: 'Kayıt yapılıyor...',
      loginPrompt: 'Zaten hesabınız var mı?',
      loginLink: 'Giriş yap',
      successRedirect: 'Kısa süre içinde giriş sayfasına yönlendirileceksiniz...',
      errorRequired: 'gereklidir',
      errorEmail: 'Lütfen geçerli bir e-posta adresi girin',
      errorMinLength: 'en az',
      errorMinLengthSuffix: 'karakter olmalıdır',
      errorPasswordMismatch: 'Şifreler eşleşmiyor',
      errorPrivacy: 'Gizlilik politikasını kabul etmelisiniz',
      errorGeneric: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    }
  };

  // Getter für aktuelle Sprache
  get currentLang(): string {
    return this.registerForm.get('language')?.value || 'de';
  }

  // Getter für aktuelle Übersetzungen
  get t(): { [key: string]: string } {
    return this.translations[this.currentLang] || this.translations['de'];
  }

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
      masterBeraterEmail: ['', [Validators.email]],
      language: ['de', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptPrivacy: [false, [Validators.requiredTrue]]
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

    const { firstName, lastName, email, phone, password, language } = this.registerForm.value;

    this.authService.register({ firstName, lastName, email, phone, password, language }).subscribe({
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
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} ${this.t['errorRequired']}`;
      if (field.errors['email']) return this.t['errorEmail'];
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} ${this.t['errorMinLength']} ${field.errors['minlength'].requiredLength} ${this.t['errorMinLengthSuffix']}`;
      if (field.errors['passwordMismatch']) return this.t['errorPasswordMismatch'];
      if (fieldName === 'acceptPrivacy' && field.errors['required']) return this.t['errorPrivacy'];
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labelsDE: any = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      phone: 'Telefon',
      password: 'Passwort',
      confirmPassword: 'Passwort wiederholen'
    };
    const labelsTR: any = {
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      password: 'Şifre',
      confirmPassword: 'Şifre tekrar'
    };
    const labels = this.currentLang === 'tr' ? labelsTR : labelsDE;
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  error = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Token aus URL-Parameter holen
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.verifyEmail(token);
      } else {
        this.loading = false;
        this.error = 'Kein Verifizierungs-Token gefunden. Bitte überprüfen Sie den Link in Ihrer E-Mail.';
      }
    });
  }

  verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = true;
          this.message = response.message || 'E-Mail erfolgreich verifiziert!';

          // Nach 3 Sekunden zum Login weiterleiten
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      },
      error: (error) => {
        this.loading = false;
        this.success = false;
        this.error = error.error?.message || 'Verifizierung fehlgeschlagen. Der Link ist möglicherweise abgelaufen.';
      }
    });
  }
}

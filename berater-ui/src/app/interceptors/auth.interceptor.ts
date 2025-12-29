import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
// WebSocket temporarily disabled for performance
// import { Injector } from '@angular/core';
// import { WebsocketService } from '../services/websocket.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // private websocketService?: WebsocketService;

  constructor(
    private authService: AuthService
    // private injector: Injector // WebSocket temporarily disabled
  ) {
    // WebSocket temporarily disabled for performance
    // Lazy load WebSocket service to avoid circular dependency
    // setTimeout(() => {
    //   this.websocketService = this.injector.get(WebsocketService);
    // });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Token zu Request hinzufügen
    const token = this.authService.getToken();

    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    // WICHTIG: Cookies müssen mitgesendet werden
    request = request.clone({
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/login') && !request.url.includes('/auth/refresh')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        // WebSocket temporarily disabled for performance
        // tap((response: any) => {
        //   // WebSocket mit neuem Token reconnecten
        //   if (this.websocketService && response.data?.token) {
        //     this.websocketService.reconnectWithNewToken(response.data.token);
        //   }
        // }),
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.data.token);
          return next.handle(this.addTokenToRequest(request, response.data.token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // Warte bis Token erneuert wurde
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }
}

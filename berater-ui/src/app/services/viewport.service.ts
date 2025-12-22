import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ViewportService {

  private viewport$ = new BehaviorSubject<ViewportType>(this.getViewport());

  constructor(private zone: NgZone) {
    this.zone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(150),
          map(() => this.getViewport())
        )
        .subscribe(view => {
          this.zone.run(() => this.viewport$.next(view));
        });
    });
  }

  private getViewport(): ViewportType {
    const width = window.innerWidth;

    if (width < 768) return ViewportType.Mobile;
    if (width < 1024) return ViewportType.Tablet;
    return ViewportType.Desktop;
  }

  get viewportType$() {
    return this.viewport$.asObservable();
  }

  get currentViewport(): ViewportType {
    return this.viewport$.value;
  }

  isMobile(): boolean {
    return this.currentViewport === ViewportType.Mobile;
  }

  isTablet(): boolean {
    return this.currentViewport === ViewportType.Tablet;
  }

  isDesktop(): boolean {
    return this.currentViewport === ViewportType.Desktop;
  }
}

export enum ViewportType{
    Mobile = 'mobile',
    Tablet = 'tablet',
    Desktop = 'desktop'
}

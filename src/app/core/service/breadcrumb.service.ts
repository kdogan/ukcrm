import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { Breadcrumb } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubj$ = new BehaviorSubject<Breadcrumb[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubj$.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const rootRoute = this.activatedRoute.root;
      const breadcrumbs = this.buildBreadcrumbs(rootRoute);
      this.breadcrumbsSubj$.next(breadcrumbs);
    });
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      if (child.snapshot
        .data['breadcrumb']) {
        const breadcrumb: Breadcrumb = {
          label: child.snapshot.data['breadcrumb'],
          url: url
        };
        breadcrumbs.push(breadcrumb);
      }


      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  public updateBreadcrumbs(breadcrumb: Breadcrumb) {
    const updatedBreadcrumbs = this.breadcrumbsSubj$.value.map(b => {
      return b.url === breadcrumb.url ? breadcrumb : b;
    });
    this.breadcrumbsSubj$.next(updatedBreadcrumbs);
  }
}
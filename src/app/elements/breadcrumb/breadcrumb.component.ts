import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Breadcrumb } from '../../core/models'
import { filter, map } from 'rxjs';


@Component({
  selector: 'app-breadcrumb',
  template: `<nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item" *ngFor="let breadcrumb of breadcrumbs; let last = last" [ngClass]="{'active': last}">
                  <a *ngIf="!last; else lastBreadcrumb" [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
                  <ng-template #lastBreadcrumb>{{ breadcrumb.label }}</ng-template>
                </li>
              </ol>
            </nav>`,
  styles: `.breadcrumb {
    background-color: transparent;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem; 
  
    li {
      a {
        color: #007bff;
        text-decoration: none;
  
        &:hover {
          color: #0056b3; 
          text-decoration: underline;
        }
      }
  
      &.active {
        color: #6c757d;
        pointer-events: none;
      }
    }
  
    .breadcrumb-item + .breadcrumb-item::before {
      content: '/'; 
      padding: 0 0.5rem; 
      color: #6c757d;
    }
  }
  
  .breadcrumb a:hover {
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    transition: background-color 0.3s ease;
  }`
})
export class BreadcrumbComponent {

  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        const breadcrumbs: Breadcrumb[] = [];
        while (route.firstChild) {
          route = route.firstChild;
          if (route.snapshot.data['breadcrumb']) {
            breadcrumbs.push({
              label: route.snapshot.data['breadcrumb'],
              url: '/' + route.snapshot.pathFromRoot.map(seg => seg.url).join('/')
            });
          }
        }
        return breadcrumbs;
      })
    ).subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
  }
}


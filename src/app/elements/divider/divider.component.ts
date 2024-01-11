import { Component } from '@angular/core';

@Component({
  selector: 'app-divider',
  template: `<hr/>`,
  styles: ` hr {
    margin-top: 5rem;
    margin-bottom: 1rem;
    border: 0;
    border-top: 2px solid rgba(0, 0, 0, 0.315);
  }`
})
export class DividerComponent {

}

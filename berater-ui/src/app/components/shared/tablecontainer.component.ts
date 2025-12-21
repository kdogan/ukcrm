import { Component } from "@angular/core";

@Component({
    selector: 'app-table-container',
    standalone: true,
    template: `
    <div class="table-container">
        <ng-content/>
    </div>
    `,
    styles: [`    
        .table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: visible;
        }
    `]
})
export class TableContainerComponent {

}
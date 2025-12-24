import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-overlay-modal',
  standalone: true,
  imports: [],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <ng-content/>
      </div>
    </div>

  `,
  styles: `
  .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90%;
    overflow-y: auto;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    position: relative;
  }
  `
})
export class OverlayModalComponent {

  @Output() close = new EventEmitter<void>();
}

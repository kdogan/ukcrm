import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-overlay-modal',
    imports: [],
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <ng-content/>
      </div>
    </div>
  `,
    styles: `
  /* Host-spezifische Styles - Fullscreen Handling */
  :host:has(iframe:fullscreen) .modal-overlay,
  :host:has(iframe:-webkit-full-screen) .modal-overlay,
  :host:has(iframe:-moz-full-screen) .modal-overlay {
    z-index: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  `
})
export class OverlayModalComponent {

  @Output() close = new EventEmitter<void>();
}

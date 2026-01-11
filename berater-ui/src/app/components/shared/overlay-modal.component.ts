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
  .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
  }

  /* Hide modal overlay when fullscreen is active */
  :host:has(iframe:fullscreen) .modal-overlay,
  :host:has(iframe:-webkit-full-screen) .modal-overlay,
  :host:has(iframe:-moz-full-screen) .modal-overlay {
    z-index: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 60%;
    min-width:465px;
    max-width: 100%;
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

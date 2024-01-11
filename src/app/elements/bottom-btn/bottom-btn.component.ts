import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bottom-btn',
  template: `<div class="d-flex flex-row-reverse">
              <button [ngClass]="btnClass" (click)="actionEmitter()" >
                <i class="fa fa-plus"></i>
                <span style="margin-left:5px">{{text}}</span>
              </button>
            </div>`,
  styles: ``
})
export class BottomBtnComponent {

  @Input() text = "Hinzufügen";
  @Input() btnClass = "btn btn-primary btn-sm"
  @Input() icon = ""
  @Output() clickAction = new EventEmitter<void>();

  actionEmitter() {
    this.clickAction.next();
  }
}

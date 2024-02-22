import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Note } from '../../core/models';

@Component({
  selector: 'app-note-form',
  template: `<form [formGroup]="noteForm" (ngSubmit)="submit()" class="note-form">
              <mat-form-field appearance="outline" class="note-field">
                <mat-label>Notiz</mat-label>
                <textarea 
                  matInput 
                  formControlName="note" 
                  rows="4" 
                  placeholder="Schreiben Sie hier Ihre Notiz...">
                </textarea>
              </mat-form-field>
              <div class="actions">
                <button mat-raised-button color="primary" type="submit">Speichern</button>
                <button mat-button type="button" (click)="clearForm()">Leeren</button>
              </div>
            </form>`,
  styles: `.note-form {
              display: flex;
              flex-direction: column;
            }
            .note-field {
              width: 100%;
              margin-bottom: 16px;
            }
            .actions {
              display: flex;
              justify-content: flex-end;
            }
            .actions button {
              margin-left: 8px;
            }
          `
})
export class NoteFormComponent implements OnInit {

  @Input() noteInput!:Note|null
  @Output() noteOutput = new EventEmitter<string>();

  noteForm = new FormGroup({
    note: new FormControl('')
  });

  ngOnInit(): void {
    if(this.noteInput)
      this.noteForm.get("note")?.setValue(this.noteInput.text);
  }

  submit() {
    this.noteOutput.next(this.noteForm.value.note??"");
  }

  clearForm() {
    this.noteForm.reset();
  }
}
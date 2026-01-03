import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { meterTypes } from "src/app/models/meter.model";
import { Util } from "../util/util";

@Component({
    selector: 'app-meter-create',
    imports: [CommonModule, FormsModule],
    standalone:true,
    template: `
      <div class="modal-header">
        <h2>{{ isEditMode ? 'Zähler bearbeiten' : 'Neuer Zähler' }}</h2>
        <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>
        @if(meter){
        <form (ngSubmit)="save.emit()" #meterForm="ngForm">
            <div class="form-group">
            <label for="meter-number-input">Zählernummer *</label>
            <input type="text" id="meter-number-input" name="meterNumber" [(ngModel)]="meter.meterNumber" required
                placeholder="z.B. Z-2024-001" class="form-control" />
            </div>

            <div class="form-group">
            <label for="meter-type-select">Typ *</label>
            <select id="meter-type-select" name="type" [(ngModel)]="meter.type" required class="form-control">
                <option value="">Bitte wählen</option>
                @for(type of meterTypes; track type) {
                  <option [value]="type">{{getTypeLabel(type)}}</option>
                }
            </select>
            </div>
            <div class="form-group">
            <label for="meter-malo-input">Malo Id</label>
            <input type="text" id="meter-malo-input" name="maloId" [(ngModel)]="meter.maloId"
                placeholder="" class="form-control" />
            </div>
            <div class="form-row">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox"
                                id="meter-two-tariff-check"
                                name="isTwoTariff"
                                [(ngModel)]="meter.isTwoTariff"
                        />
                        <label for="meter-two-tariff-check" style="margin: 0;">Zwei-Tarif-Zähler (HT/NT)</label>
                    </div>
                    <small style="display: block; color: #666; margin-top: 0.5rem; margin-left: 0;">
                        <i class="fas fa-info-circle"></i> Für Stromzähler mit Tag/Nacht-Tarif (Hochtarif/Niedrigtarif)
                    </small>
            </div>

            <label>Standort:</label>
             <hr/>
            <div class="form-group">
                <label for="meter-street-input">Strasse</label>
                <input type="text"
                    id="meter-street-input"
                    name="street"
                    [(ngModel)]="meter.location.street"
                    placeholder="Straße und Hausnummer"
                    class="form-control" />
                <div class="form-row">
                    <div class="form-group">
                        <label for="meter-zip-input">PLZ</label>
                        <input type="text"
                            id="meter-zip-input"
                            name="zip"
                            [(ngModel)]="meter.location.zip"
                            placeholder="PLZ"
                            class="form-control"
                        />
                    </div>
                    <div class="form-group">
                        <label for="meter-city-input">Ort</label>
                        <input type="text"
                            id="meter-city-input"
                            name="city"
                            [(ngModel)]="meter.location.city"
                            placeholder="Ort"
                            class="form-control"
                        />
                    </div>
                </div>
            </div>

            <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="close.emit()">Abbrechen</button>
            <button type="submit" class="btn-primary" [disabled]="!meterForm.form.valid">
                {{ isEditMode ? 'Speichern' : 'Erstellen' }}
            </button>
            </div>
        </form>
    }
    `,
    styles: ``
    
})
export class MeterCreateComponent {

    @Input() set meter(value: any) {
        // Ensure location object exists to prevent Firefox errors
        if (value && !value.location) {
            value.location = {
                street: '',
                zip: '',
                city: ''
            };
        }
        this._meter = value;
    }
    get meter(): any {
        return this._meter;
    }
    private _meter: any;

    @Input() isEditMode = false;
    @Output() save = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    meterTypes = meterTypes;
    currentYear = new Date().getFullYear();

    getTypeLabel(type:string){
        return Util.getMeterTypeLabel(type);
    }


}
import { MeterType, meterTypes } from "src/app/models/meter.model";

export class Util {
  static isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  } 
   static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  static getMeterTypeWithLabel():{key:MeterType, value:string}[] {
    return [
      {key:MeterType.Electricity, value:'Strom'},
      {key:MeterType.Gas, value:'Gas'},
      {key:MeterType.Water, value:'Wasser'},
      {key:MeterType.Heat, value:'Wärme'},
    ]
  }

  static getMeterTypeLabel(type: string): string {
    return this.getMeterTypeWithLabel().find(t => t.key == (type as MeterType))?.value??type;
  }
  static getMeterStatusLabel(isActive: boolean): string {
    return isActive ? 'Frei' : 'Belegt';
  }
}
export class Util {
  static isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  } 
   static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
  static getMeterTypeLabel(type: string): string {
    const labels: any = { electricity: 'Strom', gas: 'Gas', water: 'Wasser', heat: 'Wärme' };
    return labels[type] || type;
  }
  static getMeterStatusLabel(isActive: boolean): string {
    return isActive ? 'Frei' : 'Belegt';
  }
}
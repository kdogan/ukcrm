export interface Meter {
  _id: string;
  meterNumber: string;
  type: MeterType;
  beraterId:string;
  currentCustomerId?: any;
  currentReading:number;
  lastReadingDate:Date;
  manufacturer:string;
  location: Address;
  isFree:boolean;
  installationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  maloId:string;
}
export interface Address {
  street: string;
  zip: string;
  city: string;
  country?: string;
}

export enum MeterType {
  Electricity = 'electricity',
  Gas = 'gas',
  Water = 'water',
  Heat = 'heat'
} 
export const meterTypes: MeterType[] = [
  MeterType.Electricity,
  MeterType.Gas,
  MeterType.Water,
  MeterType.Heat
];
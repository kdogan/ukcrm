
export interface Contract {
    id: string;
    zaehlernummer: string;
    vertragnummer: string;
    firma: string;
    vertragstart: string;
    vertragsende: string;
    status: ContractState;
    kundennummer: string
}
export enum ContractState {
    ENTWURF = 'Entwurf',
    BEARBEITUNG ='Bearbeitung',
    BELIEFERUNG ='Belieferung',
    GEKUENDIGT='Gekündigt', 
    BEENDET='Beende',
}

export interface Breadcrumb {
    label: string;
    url: string;
}
export interface Customer {
    id: string;
    firstname:string;
    lastname:string;
}

export interface Address {
    street: string;
    city: string;
    zipCode: string
    country: string;
  }

export interface Counter {
    id:number;
    nummer:string;
    address:Address;
}


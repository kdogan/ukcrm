
export interface Contract {
    _id?: string;
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
    BEENDET='Beendet',
}

export interface Breadcrumb {
    label: string;
    url: string;
}
export interface Customer {
    _id?: string;
    firstname:string;
    lastname:string;
    email?:string;
    phone?:string;
    address?:Address;
    contracts?:any[];
    __v?:number
}

export interface Address {
    street: string;
    city: string;
    zipCode: string
    country: string;
    _id?:string;
  }

export interface Counter {
    _id?:string;
    zaehlernummer:string;
    address:Address;
    type:CounterType;
    user?:string;
    __v?:number
}

export interface User {
    _id?:string;
    firstname: string,
    middlename:string,
    lastname: string,
    email:string,
    phone_mobile:string,
    phone:string,
    address: Address,
    token:string
};

export enum CounterType {
    STROM='Strom',
    GAS='Gas'
}

export interface Task {
    _id?: string;
    title: string;
    description: string;
    status: TaskStatus;
  }
  export enum TaskStatus {
    ACTIVE='active',
    COMPLETED='completed'
  }

  export interface Note {
    _id?:string;
    text:string;
    customerId:string;
    user_id:string;
  }


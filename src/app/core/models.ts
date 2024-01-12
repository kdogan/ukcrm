
export interface Contract {
    id: string;
    zaehlernummer: string;
    vertragnummer: string;
    firma: string;
    vertragstart: string;
    vertragsende: string;
    status: boolean;
    kundennummer: string
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


export interface Customer {
    id: string;
    name: string;
}

export interface Contract {
    id:string;
    zaehlernummer:string;
    vertragnummer:string;
    firma:string;
    vertragstart:string;
    vertragsende:string;
    status:boolean;
    kundennummer:string
}
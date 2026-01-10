export enum ContractState {
    ACTIVE = 'active',
    DRAFT = 'draft',
    ARCHIVED = 'archived',
    ENDET = 'ended'
}

export const stateToLabel: Record<ContractState, string> = {
  active: 'Belieferung',
  draft: 'Entwurf',
  archived: 'Gekündigt',
  ended:'Beendet'
};

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  customerId: any;
  meterId: any;
  supplierId: any;
  isCommercial?: boolean;
  commercialName?: string;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  status: ContractState;
  notes?: string;
  attachments?: Attachment[];
  daysRemaining?: number;
  createdAt: Date;
  updatedAt: Date;
  supplierContractNumber?:string
}
export enum ContractState {
    ACTIVE = 'active',
    DRAFT = 'draft',
    ARCHIVED = 'archived',
    ENDET = 'ended'
}

export const stateToLabel: Record<ContractState, string> = {
  active: 'Belieferung',
  draft: 'Entwurf',
  archived: 'Archiviert',
  ended:'Beendet'
};
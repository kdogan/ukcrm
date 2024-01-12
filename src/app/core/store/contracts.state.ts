import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Contract } from '../models';
import { AddContract } from './contract.action';

export class ContractsStateModel {
  public contracts: Contract[]=[];
}

@State<ContractsStateModel>({
  name: 'contracts',
  defaults: {
    contracts: []
  }
})

export class ContractsState {
  @Selector()
  static getAllContracts(state: ContractsStateModel) {
    return state.contracts;
  }

  @Selector()
  static getContractById(state: ContractsStateModel) {
    return (contractId: string) => {
      return state.contracts?.find(contract => contract.vertragnummer === contractId);
    };
  }

  @Action(AddContract)
  add({ getState, patchState }: StateContext<ContractsStateModel>, { payload }: AddContract) {
    const state = getState();
    patchState({ contracts: [...state.contracts, payload] });
  }
}
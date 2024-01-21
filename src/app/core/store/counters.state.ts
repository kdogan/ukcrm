import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Counter } from '../models';
import { AddCounter } from './counter.action';

export class CountersStateModel {
  public counters: Counter[]=[];
}

@State<CountersStateModel>({
  name: 'counters',
  defaults: {
    counters: []
  }
})

export class CountersState {
  @Selector()
  static getAllCounters(state: CountersStateModel) {
    return state.counters;
  }

  @Selector()
  static getCounterById(state: CountersStateModel) {
    return (zaehlernummer: string) => {
      return state.counters?.find(counter => counter.zaehlernummer === zaehlernummer);
    };
  }

  @Action(AddCounter)
  add({ getState, patchState }: StateContext<CountersStateModel>, { payload }: AddCounter) {
    const state = getState();
    patchState({ counters: [...state.counters, payload] });
  }
}
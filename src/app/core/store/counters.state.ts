import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Counter } from '../models';
import { AddAllCounters, AddCounter } from './counter.action';
import { Injectable } from '@angular/core';


export class CountersStateModel {
  public counters: Counter[]=[];
}

@State<CountersStateModel>({
  name: 'counters',
  defaults: {
    counters: []
  }
})
@Injectable()
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

  @Action(AddAllCounters)
  addAll({ getState, patchState }: StateContext<CountersStateModel>, { payload }: AddAllCounters) {
    const state = getState();
    patchState({ counters: [...state.counters, ...payload] });
  }
}
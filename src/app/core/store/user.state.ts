import { State, Action, StateContext, Selector } from '@ngxs/store';
import { User } from '../models';
import { SetCurrentUser } from './user.action';
import { Injectable } from '@angular/core';

export class UserStateModel {
  public currentUser: User|undefined;
}

@State<UserStateModel>({
  name: 'currentUser',
  defaults: {
    currentUser: undefined
  }
})
@Injectable()
export class UserState {
  @Selector()
  static getAllUser(state: UserStateModel) {
    return state.currentUser;
  }

  @Selector()
  static getCurrentUser(state: UserStateModel) {
    return (zaehlernummer: string) => {
      return state.currentUser;
    };
  }

  @Action(SetCurrentUser)
  add({ getState, patchState }: StateContext<UserStateModel>, { payload }: SetCurrentUser) {
    const state = getState();
    patchState({ currentUser: payload });
  }
}
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Breadcrumb } from '../models';
import { Injectable } from '@angular/core';

export class CreateBreadcrumbs {
  static readonly type = '[Breadcrumbs] Add';
  constructor(public payload: Breadcrumb) {}
}
export class UpdateBreadcrumb {
  static readonly type = '[Breadcrumbs] Update';
  constructor(public payload: Breadcrumb) {}
}

export class BreadcrumbsStateModel {
  public breadcrumbs: Breadcrumb|undefined=undefined;
}

@State<BreadcrumbsStateModel>({
  name: 'breadcrumbs',
  defaults: {
    breadcrumbs: undefined
  }
})

@Injectable()
export class BreadcrumbsState {
  @Selector()
  static getAllbreadcrumbs(state: BreadcrumbsStateModel) {
    return state.breadcrumbs;
  }

  @Action(CreateBreadcrumbs)
  add({ getState, patchState }: StateContext<BreadcrumbsStateModel>, { payload }: CreateBreadcrumbs) {
    const state = getState();
    patchState({ breadcrumbs:  payload });
  }
  @Action(UpdateBreadcrumb)
  update({ getState, patchState }: StateContext<BreadcrumbsStateModel>, { payload }: UpdateBreadcrumb) {
    const state = getState();
    patchState({ breadcrumbs: payload });
  }
}
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Breadcrumb } from '../models';

export class CreateBreadcrumbs {
  static readonly type = '[Breadcrumbs] Add';
  constructor(public payload: Breadcrumb[]) {}
}
export class UpdateBreadcrumb {
  static readonly type = '[Breadcrumbs] Update';
  constructor(public payload: Breadcrumb) {}
}

export class BreadcrumbsStateModel {
  public breadcrumbs: Breadcrumb[]=[];
}

@State<BreadcrumbsStateModel>({
  name: 'breadcrumbs',
  defaults: {
    breadcrumbs: []
  }
})

export class BreadcrumbsState {
  @Selector()
  static getAllbreadcrumbs(state: BreadcrumbsStateModel) {
    return state.breadcrumbs;
  }

  @Action(CreateBreadcrumbs)
  add({ getState, patchState }: StateContext<BreadcrumbsStateModel>, { payload }: CreateBreadcrumbs) {
    const state = getState();
    patchState({ breadcrumbs: [...state.breadcrumbs, payload] });
  }
  @Action(UpdateBreadcrumb)
  update({ getState, patchState }: StateContext<BreadcrumbsStateModel>, { payload }: AddBreadcrumbs) {
    const state = getState();
    patchState({ breadcrumbs: [...state.breadcrumbs, payload] });
  }
}
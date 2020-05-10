import { IState } from './types';

const initialState: IState = {
  lists: [],
  newItemButtonVisibility: false,
};

const rootReducer = (state: IState = initialState, action: any): IState => {
  switch (action.type) {
    case 'SET_LISTS':
      return { ...state, lists: action.payload };
    case 'SET_NEW_ITEM_BUTTON_VISIBILITY':
      return { ...state, newItemButtonVisibility: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
export const setLists = (lists:any) => ({
  payload: lists,
  type: 'SET_LISTS',
});

export const setNewItemButtonVisiblity = (visible: boolean) => ({
  type: 'SET_NEW_ITEM_BUTTON_VISIBILITY',
  payload: visible,
});
export interface IState {
  lists: IList[];
  newItemButtonVisibility: boolean;
}

export interface IListDetail {
  id: number;
  text: string;
  priority: boolean;
  date: Date;
}

export interface IList {
  key: string;
  name: string;
  detail: IListDetail[];
  date: Date;
}

export interface IEditItem {
  editingItem: boolean;
  editingItemId: number | null;
}

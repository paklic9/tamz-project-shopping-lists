import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {setLists} from "../actions";
import {IState} from "../types";

const useLists = () => {
  const dispatch = useDispatch();
  const lists = useSelector<IState, any[]>(state => state.lists);
  const listsNames:string[] = lists.map((item, i) => {
    return item.name
  });

  const refetchLists = React.useCallback((clearing:boolean = false) => {
    if(localStorage.length > 0 && !clearing){
      let lists = [];
      for(let i=0; i<localStorage.length; i++){
        const myKey = localStorage.key(i);
        const item = JSON.parse(localStorage.getItem(myKey as string) as string);
        lists.push(item);
      }
      dispatch(setLists(lists));
    }
    else if(localStorage.length === 0 && clearing){
      dispatch(setLists([]));
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (lists.length === 0) {
      refetchLists();
    }
  }, [refetchLists, lists]);

  return { refetchLists, lists, listsNames };
};

export default useLists;

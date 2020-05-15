import * as React from 'react';
import {ReactNode} from 'react';
import {Form, FormControl, Table as TableB} from "react-bootstrap";
import {handleInputChange} from "../../utils";
import {audioOnClick} from "./Sounds";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {IEditItem, IList, IListDetail} from "../../types";
import useLists from "../../hooks/useLists";
import NewItem from "./NewItem";

interface IProps {
  list: IList;
  setNewItemText: (newItemText: string) => void;
  newItemText: string;
  setNewItemPriority: (newItemPriority: boolean) => void;
  newItemPriority: boolean;
  newItem: boolean;
  setEditItem: (editItem: IEditItem | null) => void;
  editItem: IEditItem | null;
  resetInputs: () => void;
  confirmDelete: (button: JSX.Element, type: number, listKey: string, detailId: number) => ReactNode;
  setShowErrorText: (showErrorText: boolean) => void;
}

const Table: React.FC<IProps> = (
  {
    list,
    setNewItemText,
    newItemText,
    setNewItemPriority,
    newItem,
    newItemPriority,
    setEditItem,
    editItem,
    resetInputs,
    confirmDelete,
    setShowErrorText
  }) => {
  const {refetchLists} = useLists();

  const handleAddItemToList = React.useCallback((key: IList['key']) => {
    const valid = (document.getElementById('text') as HTMLInputElement).validity.valid;
    if (valid) {
      const list: IList = JSON.parse(localStorage.getItem(key) as string);
      const newDetail: IListDetail = {
        id: list.detail.length > 0 ? list.detail[list.detail.length - 1].id + 1 : 1,
        text: newItemText,
        priority: newItemPriority,
        date: new Date()
      }
      list.detail.push(newDetail);
      const myJSON = JSON.stringify(list);
      localStorage.setItem(list.key, myJSON);
      resetInputs();
      refetchLists();
      setShowErrorText(false);
    } else {
      setShowErrorText(true);
    }
  }, [resetInputs, newItemText, newItemPriority, refetchLists, setShowErrorText])

  const handleEditItemInList = React.useCallback((key: IList['key'], detail: IListDetail) => {
    const valid = (document.getElementById('text') as HTMLInputElement).validity.valid;
    if (valid) {
      setEditItem(null);
      const list: IList = JSON.parse(localStorage.getItem(key) as string);
      const newDetail: IListDetail = {id: detail.id, text: newItemText, priority: newItemPriority, date: new Date()}
      list.detail[detail.id - 1] = {...newDetail};
      const myJSON = JSON.stringify(list);
      localStorage.setItem(list.key, myJSON);
      resetInputs();
      refetchLists();
      setShowErrorText(false);
    } else {
      setShowErrorText(true);
    }
  }, [newItemText, newItemPriority, refetchLists, resetInputs, setShowErrorText, setEditItem])

  return (
    <TableB bordered hover size="sm" className="table">
      <thead>
      <tr style={{backgroundColor: 'rgb(220,220,220)'}}>
        <th className="id">id</th>
        <th className="text">Text</th>
        <th className="priority">Priority</th>
        <th className="actions">Actions</th>
      </tr>
      </thead>
      <tbody>
      {list.detail.map((detail: IListDetail, index) => (
        <tr
          key={"detal" + index}
          style={detail.priority ? {
            backgroundColor: 'rgb(190,0,0)',
            color: 'white'
          } : {backgroundColor: 'rgb(220,220,220)'}}
        >
          <td className="textCentered">{detail.id}</td>
          <td>
            {editItem?.editingItemId === detail.id ? (
              <FormControl
                id="text"
                required
                as="textarea"
                value={newItemText}
                onChange={handleInputChange(setNewItemText)}
              />
            ) : (
              detail.text
            )}
          </td>
          <td className="textCentered">
            {editItem?.editingItemId === detail.id ? (
              <Form.Check
                checked={newItemPriority}
                className="priorityCheckbox"
                type="checkbox"
                id={'priority' + new Date(detail.date).getTime()}
                onChange={() => {
                  audioOnClick.play();
                  setNewItemPriority(
                    (document.getElementById('priority' + new Date(detail.date).getTime()) as HTMLInputElement).checked
                  );
                }}
              />
            ) : (
              detail.priority ? "True" : "False"
            )}
          </td>
          <td>
            <div className="sapceBetween">
              <span
                className={`${(newItem || (editItem?.editingItem && editItem.editingItemId !== detail.id)) ? 'disabledWrapper' : ''}`}
              >
                {editItem?.editingItemId === detail.id ? (
                  <FontAwesomeIcon
                    icon={faCheckSquare}
                    className="controlIcon"
                    onClick={() => {
                      audioOnClick.play();
                      handleEditItemInList(list.key, detail);
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faEdit}
                    className={`controlIcon ${(newItem || (editItem?.editingItem && editItem.editingItemId !== detail.id)) && 'disabled'}`}
                    onClick={() => {
                      audioOnClick.play();
                      setEditItem({editingItem: true, editingItemId: detail.id});
                      setNewItemText(detail.text);
                      setNewItemPriority(detail.priority);
                    }}
                  />
                )}
              </span>
              <span
                className={`${(newItem || (editItem && editItem.editingItem)) ? 'disabledWrapper' : ''}`}
              >
                {confirmDelete(
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    className={`controlIcon ${(newItem || (editItem && editItem.editingItem)) && 'disabled'}`}
                    onClick={() => audioOnClick.play()}
                  />,
                  3,
                  list.key,
                  detail.id
                )}
              </span>
            </div>
          </td>
        </tr>
      ))}
      {newItem ? (
        <NewItem resetInputs={resetInputs} setNewItemPriority={setNewItemPriority} setNewItemText={setNewItemText}
                 list={list} handleAddItemToList={handleAddItemToList}/>
      ) : undefined}
      </tbody>
    </TableB>
  );
};

export default Table;
import * as React from 'react';
import {Form, FormControl} from "react-bootstrap";
import {handleInputChange} from "../../utils";
import {audioOnClick} from "./Sounds";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {IList, IListDetail} from "../../types";
import useLists from "../../hooks/useLists";

interface IProps {
  list: IList;
  setNewItemText: (newItemText: string) => void;
  newItemText: string;
  setNewItemPriority: (newItemPriority: boolean) => void;
  newItemPriority: boolean;
  resetInputs: () => void;
  setShowErrorText: (showErrorText: boolean) => void;
}

const NewItem: React.FC<IProps> = (
  {
    list,
    setNewItemText,
    newItemText,
    setNewItemPriority,
    newItemPriority,
    resetInputs,
    setShowErrorText
  }) => {
  const {refetchLists} = useLists();

  const handleAddItemToList = React.useCallback((key: IList['key']) => {
    const valid = (document.getElementById('textNew') as HTMLInputElement).validity.valid;
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

  return (
    <>
      <tr>
        <td className="textCentered">
          {list.detail.length > 0 ? list.detail[list.detail.length - 1].id + 1 : 1}
        </td>
        <td>
          <FormControl
            id="textNew"
            required
            as="textarea"
            value={newItemText}
            onChange={handleInputChange(setNewItemText)}/>
        </td>
        <td>
          <Form.Check
            className="priorityCheckbox"
            type="checkbox"
            id="priority"
            onChange={() => {
              audioOnClick.play();
              setNewItemPriority(
                (document.getElementById('priority') as HTMLInputElement).checked
              );
            }}
          />
        </td>
        <td className="sapceBetween">
          <FontAwesomeIcon
            icon={faPlus}
            className="controlIcon"
            onClick={() => {
              audioOnClick.play();
              handleAddItemToList(list.key);
            }}
          />
          <FontAwesomeIcon
            icon={faTimes}
            className="controlIcon"
            onClick={() => {
              audioOnClick.play();
              resetInputs();
            }}
          />
        </td>
      </tr>
    </>
  );
};

export default NewItem;
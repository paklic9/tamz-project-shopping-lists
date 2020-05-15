import * as React from 'react';
import {Form, FormControl} from "react-bootstrap";
import {handleInputChange} from "../../utils";
import {audioOnClick} from "./Sounds";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {IList} from "../../types";

interface IProps {
  list: IList;
  setNewItemText: (newItemText: string) => void;
  setNewItemPriority: (newItemPriority: boolean) => void;
  handleAddItemToList: (key: IList['key']) => void;
  resetInputs: () => void;
}

const NewItem: React.FC<IProps> = ({list, setNewItemText, setNewItemPriority, handleAddItemToList, resetInputs}) => {
  return (
    <>
      <tr>
        <td className="textCentered">
          {list.detail.length > 0 ? list.detail[list.detail.length - 1].id + 1 : 1}
        </td>
        <td>
          <FormControl
            required
            id="text"
            as="textarea"
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
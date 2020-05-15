import * as React from 'react';
import {Alert, Button, Col, Form, Modal, Row} from "react-bootstrap";
import {handleInputChange} from "../../utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudDownloadAlt, faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons";
import {IList} from "../../types";
import {setNewItemButtonVisiblity} from "../../actions";
import useLists from "../../hooks/useLists";
import {useDispatch} from "react-redux";
import {audioOnClick} from "./Sounds";
import {ReactNode} from "react";

interface IProps {
  editListObj: IList | null;
  setEditListObj: (editListObj: IList | null) => void;
  confirmDelete: (button: JSX.Element, type: number, listKey?: string, detailId?: number) => ReactNode;
}

const Buttons: React.FC<IProps> = ({editListObj, setEditListObj, confirmDelete}) => {
  const dispatch = useDispatch();
  const {refetchLists, lists} = useLists();
  const [newList, setNewList] = React.useState<Boolean>(false);
  const [editList, setEditList] = React.useState<Boolean>(false);
  const [newListName, setNewListName] = React.useState<string>('');
  const [showErrorListName, setShowErrorListName] = React.useState(false);

  const handleModalClose = () => {
    setNewList(false);
    setEditList(false);
    setNewListName('');
  }

  const handleAddList = React.useCallback(() => {
    const valid = (document.getElementById('name') as HTMLInputElement).validity.valid;
    if (valid) {
      const myDate = new Date();
      const myKey = newListName + myDate.getTime();
      const myObj = {key: myKey, name: newListName, detail: [], date: new Date()};
      const myJSON = JSON.stringify(myObj);
      localStorage.setItem(myKey, myJSON);
      handleModalClose();
      refetchLists();
      setShowErrorListName(false);
    } else {
      setShowErrorListName(true);
    }
  }, [newListName, refetchLists])

  const handleSaveList = React.useCallback(() => {
    const valid = (document.getElementById('name') as HTMLInputElement).validity.valid;
    if (editListObj && valid) {
      const list: IList = JSON.parse(localStorage.getItem(editListObj!.key) as string);
      list.name = newListName;
      list.date = new Date();
      const myJSON = JSON.stringify(list);
      localStorage.setItem(editListObj!.key, myJSON);
      setEditListObj(null);
      dispatch(setNewItemButtonVisiblity(false));
      handleModalClose();
      refetchLists();
      setShowErrorListName(false);
    } else if (!valid) {
      setShowErrorListName(true);
    }
  }, [editListObj, refetchLists, newListName, dispatch, setEditListObj])

  const handleExportLists = React.useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(lists)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "lists.json";
    // row below needed probably for older firefox, latest quantum firefox support most features from web-kit
    document.body.appendChild(element);
    element.click();
  }, [lists])

  const handleImportLists = React.useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const fileReader: FileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target) {
          const importedLists: IList[] = JSON.parse(e.target.result as string);
          importedLists.forEach((list: IList, index) => {
            const myDate = new Date();
            const myKey = list.name + myDate.getTime() + index;
            const myObj = {key: myKey, name: list.name, detail: list.detail};
            const myJSON = JSON.stringify(myObj);
            localStorage.setItem(myKey, myJSON);
          })
          refetchLists();
        }
      };
      fileReader.readAsText(file);
    }
    (document.getElementById("importFile") as HTMLInputElement).value = "";
  }, [refetchLists])

  return (
    <Row className="controls">
      <Col>
        <Modal
          key="addModal"
          show={newList || editList}
          size="sm"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          onHide={() => handleModalClose()}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              {editList ? 'Edit list' : 'Add new list'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="Enter list name"
                value={newListName}
                onChange={handleInputChange(setNewListName)}
              />
            </Form.Group>
            {showErrorListName ? (
              <Alert variant="danger" onClose={() => setShowErrorListName(false)} dismissible>
                <Alert.Heading>Error</Alert.Heading>
                <p>Please fill the name input!</p>
              </Alert>
            ) : undefined}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {
              audioOnClick.play();
              editList ? handleSaveList() : handleAddList();
            }}>
              {editList ? 'Save' : 'Add'}
            </Button>
            <Button onClick={() => {
              handleModalClose();
              audioOnClick.play();
            }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Button onClick={() => setNewList(true)}>
          Add new list
        </Button>
        <br/>
        <Button
          disabled={!editListObj}
          onClick={() => {
            setEditList(true);
            setNewListName(editListObj ? editListObj.name : '');
          }}
        >
          Edit selected list name
        </Button>
        <br/>
        {confirmDelete(
          <Button disabled={!editListObj}>
            Remove selected list
          </Button>,
          2
        )}
        <br/>
        {confirmDelete(
          <Button disabled={lists.length === 0}>
            Remove all lists
          </Button>,
          1
        )}
        <br/>
        <Button
          disabled={lists.length === 0}
          onClick={() => handleExportLists()}
        >
          <FontAwesomeIcon icon={faCloudDownloadAlt}/> Export lists
        </Button>
        <br/>
        <span>
            <label htmlFor="importFile" className="importFile btn btn-primary" onClick={() => audioOnClick.play()}>
              <FontAwesomeIcon icon={faCloudUploadAlt}/> Import lists
            </label>
            <input
              type='file'
              id='importFile'
              accept='.json'
              onChange={e => handleImportLists(e)}
            />
          </span>
      </Col>
    </Row>
  );
};

export default Buttons;
import * as React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, Col, Form, FormControl, ListGroup, Modal, Row, Tab, Table} from "react-bootstrap";
import {handleInputChange} from "../utils";
import useLists from "../hooks/useLists";
import {IEditItem, IList, IListDetail, IState} from "../types";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faCheckSquare,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faEdit,
  faPlus,
  faTimes,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'
import {setNewItemButtonVisiblity} from "../actions";

const Lists: React.FC = () => {
  const dispatch = useDispatch();
  const [newItem, setNewItem] = React.useState<Boolean>(false);
  const [editItem, setEditItem] = React.useState<IEditItem | null>(null);
  const [newList, setNewList] = React.useState<Boolean>(false);
  const [editList, setEditList] = React.useState<Boolean>(false);
  const [editListObj, setEditListObj] = React.useState<IList | null>(null);
  const [newListName, setNewListName] = React.useState<string>('');
  const [newItemText, setNewItemText] = React.useState<string>('');
  const [newItemPriority, setNewItemPriority] = React.useState<boolean>(false);
  const {refetchLists, lists} = useLists();
  const newItemButtonVisiblity = useSelector<IState, boolean>(state => state.newItemButtonVisibility);

  const resetInputs = React.useCallback(() => {
    if (newItem) {
      (document.getElementById('priority') as HTMLInputElement).checked = false;
      (document.getElementById('text') as HTMLInputElement).value = "";
      setNewItem(false);
    }
    setNewItemText('');
    setNewItemPriority(false);
    setEditItem(null);
  }, [newItem])

  const handleClear = React.useCallback((clearing: boolean) => {
    localStorage.clear();
    refetchLists(clearing);
  }, [refetchLists])

  const handleModalClose = () => {
    setNewList(false);
    setEditList(false);
    setNewListName('');
  }

  const handleRemoveList = React.useCallback(() => {
    if (editListObj) {
      localStorage.removeItem(editListObj.key)
      setEditListObj(null);
      dispatch(setNewItemButtonVisiblity(false));
      if (localStorage.length === 0) {
        refetchLists(true);
      } else {
        refetchLists();
      }
    }
  }, [editListObj, refetchLists, dispatch])

  const handleAddList = React.useCallback(() => {
    const myDate = new Date();
    const myKey = newListName + myDate.getTime();
    const myObj = {key: myKey, name: newListName, detail: [], date: new Date()};
    const myJSON = JSON.stringify(myObj);
    localStorage.setItem(myKey, myJSON);
    handleModalClose();
    refetchLists();
  }, [newListName, refetchLists])

  const handleSaveList = React.useCallback(() => {
    if (editListObj) {
      const list: IList = JSON.parse(localStorage.getItem(editListObj!.key) as string);
      list.name = newListName;
      list.date = new Date();
      const myJSON = JSON.stringify(list);
      localStorage.setItem(editListObj!.key, myJSON);
      setEditListObj(null);
      dispatch(setNewItemButtonVisiblity(false));
      handleModalClose();
      refetchLists();
    }
  }, [editListObj, refetchLists, newListName, dispatch])

  const handleAddItemToList = React.useCallback((key: IList['key']) => {
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
  }, [resetInputs, newItemText, newItemPriority, refetchLists])

  const handleDeleteItemFromList = React.useCallback((key: IList['key'], detailId: number) => {
    const list: IList = JSON.parse(localStorage.getItem(key) as string);
    list.detail.splice(list.detail.findIndex(item => item.id === detailId), 1)
    const myJSON = JSON.stringify(list);
    localStorage.setItem(list.key, myJSON);
    refetchLists();
  }, [refetchLists])

  const handleEditItemInList = React.useCallback((key: IList['key'], detail: IListDetail) => {
    console.log("aaaa");
    setEditItem(null);
    const list: IList = JSON.parse(localStorage.getItem(key) as string);
    const newDetail: IListDetail = {id: detail.id, text: newItemText, priority: newItemPriority, date: new Date()}
    list.detail[detail.id - 1] = {...newDetail};
    const myJSON = JSON.stringify(list);
    localStorage.setItem(list.key, myJSON);
    resetInputs();
    refetchLists();
  }, [newItemText, newItemPriority, refetchLists, resetInputs])

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
    <>
      <Row>
        <Col>
          <Tab.Container id="list-group-tabs-example">
            <Row>
              <Col xs={4} style={{minWidth: "125pt"}}>
                <ListGroup style={{marginTop: "5pt"}}>
                  {lists.map((list: IList, i) => (
                    <ListGroup.Item
                      className="lists"
                      onClick={() => {
                        resetInputs();
                        setEditListObj(list);
                        dispatch(setNewItemButtonVisiblity(true));
                      }}
                      href={list.name + i}
                      key={list.name + i}
                    >
                      {list.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
              <Col xs={8}>
                <Tab.Content>
                  {newItemButtonVisiblity && (
                    <Button
                      className="addNewItemButton"
                      disabled={!!(editItem?.editingItem || newItem)}
                      onClick={() => setNewItem(true)}
                    >
                      Add new item
                    </Button>
                  )}
                  {lists.map((list: IList, i) => (
                    <Tab.Pane key={"list" + i} eventKey={list.name + i}>
                      <Table bordered hover size="sm" className="table">
                        <thead>
                        <tr>
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
                            } : {backgroundColor: 'white'}}
                          >
                            <td className="textCentered">{detail.id}</td>
                            <td>
                              {editItem?.editingItemId === detail.id ? (
                                <FormControl
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
                                    setNewItemPriority(
                                      (document.getElementById('priority' + new Date(detail.date).getTime()) as HTMLInputElement).checked
                                    );
                                  }}
                                />
                              ) : (
                                detail.priority ? "True" : "False"
                              )}
                            </td>
                            <td className="sapceBetween">
                                  <span
                                    className={`${(newItem || (editItem?.editingItem && editItem.editingItemId !== detail.id)) ? 'disabledWrapper' : ''}`}
                                  >
                                    {editItem?.editingItemId === detail.id ? (
                                      <FontAwesomeIcon
                                        icon={faCheckSquare}
                                        className="controlIcon"
                                        onClick={() => handleEditItemInList(list.key, detail)}
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faEdit}
                                        className={`controlIcon ${(newItem || (editItem?.editingItem && editItem.editingItemId !== detail.id)) && 'disabled'}`}
                                        onClick={() => {
                                          setEditItem({editingItem: true, editingItemId: detail.id});
                                          setNewItemText(detail.text);
                                          setNewItemPriority(detail.priority);
                                        }}
                                      />
                                    )}
                                  </span>
                              <span
                                className={`${(newItem || (editItem && editItem.editingItem)) ? 'disabledWrapper' : ''}`}>
                                    <FontAwesomeIcon
                                      icon={faTrashAlt}
                                      className={`controlIcon ${(newItem || (editItem && editItem.editingItem)) && 'disabled'}`}
                                      onClick={() => handleDeleteItemFromList(list.key, detail.id)}
                                    />
                                  </span>
                            </td>
                          </tr>
                        ))}
                        {newItem ? (
                          <tr>
                            <td className="textCentered">
                              {list.detail.length > 0 ? list.detail[list.detail.length - 1].id + 1 : 1}
                            </td>
                            <td>
                              <FormControl
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
                                onClick={() => handleAddItemToList(list.key)}
                              />
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="controlIcon"
                                onClick={() => resetInputs()}
                              />
                            </td>
                          </tr>
                        ) : undefined}
                        </tbody>
                      </Table>
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Col>
      </Row>
      <Row className="controls">
        <Col>
          <Modal
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
              <Form.Group controlId="exampleForm.ControlInput1">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Enter list name"
                  value={newListName}
                  onChange={handleInputChange(setNewListName)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={editList ? () => handleSaveList() : () => handleAddList()}>
                {editList ? 'Save' : 'Add'}
              </Button>
              <Button onClick={() => handleModalClose()}>Close</Button>
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
          <Button
            disabled={!editListObj}
            onClick={() => handleRemoveList()}
          >
            Remove selected list
          </Button>
          <br/>
          <Button
            disabled={lists.length === 0}
            onClick={() => handleClear(true)}
          >
            Remove all lists
          </Button>
          <br/>
          <Button
            disabled={lists.length === 0}
            onClick={() => handleExportLists()}
          >
            <FontAwesomeIcon icon={faCloudDownloadAlt}/> Export lists
          </Button>
          <br/>
          <span>
                <label htmlFor="importFile" className="importFile btn btn-primary">
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
    </>
  );
};

export default Lists;
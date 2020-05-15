import * as React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {
  Alert,
  Button,
  Col,
  Form,
  FormControl,
  ListGroup,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
  Tab,
  Table
} from "react-bootstrap";
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

const popSound = require("../assets/pop.mp3");
const emptyTrash = require("../assets/RecycleBin.mp3");

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
  const [showErrorText, setShowErrorText] = React.useState(false);
  const [showErrorListName, setShowErrorListName] = React.useState(false);
  const audioOnClick = new Audio(popSound);
  const audioOnDelete = new Audio(emptyTrash);

  function addSoundToButtons() {
    const bns = document.getElementsByTagName("button");
    const svgs = document.getElementsByTagName("svg");
    for (let i = 0; i < bns.length; i++) {
      bns[i].addEventListener("click", () => audioOnClick.play());
    }
    for (let i = 0; i < svgs.length; i++) {
      svgs[i].addEventListener("click", () => audioOnClick.play());
    }
  }

  window.addEventListener("load", () => {
    addSoundToButtons();
  });

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
  }, [editListObj, refetchLists, newListName, dispatch])

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
  }, [resetInputs, newItemText, newItemPriority, refetchLists])

  const handleDeleteItemFromList = React.useCallback((key: IList['key'], detailId: number) => {
    const list: IList = JSON.parse(localStorage.getItem(key) as string);
    list.detail.splice(list.detail.findIndex(item => item.id === detailId), 1)
    const myJSON = JSON.stringify(list);
    localStorage.setItem(list.key, myJSON);
    refetchLists();
  }, [refetchLists])

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

  //type: 1=remove all lists, 2=remove selected list, 3=remove item from list
  const confirmDelete = (button: any, type: number, listKey = "", detailId = 0) => {
    return (
      <OverlayTrigger
        rootClose
        trigger="click"
        placement="top"
        overlay={
          <Popover id={`popover-positioned-top`}>
            <Popover.Title as="h3">Are you sure?</Popover.Title>
            <Popover.Content>
              <Button onClick={() => {
                audioOnDelete.play();
                document.body.click();
                if (type === 1) {
                  handleClear(true);
                } else if (type === 2) {
                  handleRemoveList();
                } else if (type === 3) {
                  handleDeleteItemFromList(listKey, detailId)
                }
              }}>
                Yes
              </Button>
              {' '}
              <Button onClick={() => {
                audioOnClick.play();
                document.body.click();
              }}>
                No
              </Button>
            </Popover.Content>
          </Popover>
        }
      >
        {button}
      </OverlayTrigger>
    )
  }

  return (
    <>
      {lists.length > 0 ? (
        <Row>
          <Col>
            <Tab.Container id="list-group-tabs-example">
              <Row>
                <Col sm={12} md={4} lg={3} style={{minWidth: "125pt"}}>
                  <h2 className="listsTitle">Lists:</h2>
                  <ListGroup style={{marginTop: "5pt"}}>
                    {lists.map((list: IList, i) => (
                      <ListGroup.Item
                        className="lists"
                        onClick={() => {
                          audioOnClick.play();
                          resetInputs();
                          setEditListObj(list);
                          dispatch(setNewItemButtonVisiblity(true));
                        }}
                        href={list.name + i}
                        key={list.name + i}
                        style={editListObj?.name === list.name ? {backgroundColor: 'rgb(0, 123, 255)'} : {backgroundColor: 'rgb(220,220,220)'}}
                      >
                        {list.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Col>
                <Col sm={12} md={8} lg={9}>
                  <Tab.Content>
                    {newItemButtonVisiblity && (
                      <div className="buttonAndTitleWrapper">
                        <h2 className="itemsTitle">Items in {editListObj?.name}:</h2>
                        <Button
                          className="addNewItemButton"
                          disabled={!!(editItem?.editingItem || newItem)}
                          onClick={() => {
                            audioOnClick.play();
                            setNewItem(true);
                          }}
                        >
                          Add new item
                        </Button>
                      </div>
                    )}
                    {lists.map((list: IList, i) => (
                      <Tab.Pane key={"list" + i} eventKey={list.name + i}>
                        <Table bordered hover size="sm" className="table">
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
                          ) : undefined}
                          </tbody>
                        </Table>
                      </Tab.Pane>
                    ))}
                  </Tab.Content>
                  {showErrorText ? (
                    <Alert variant="danger" onClose={() => setShowErrorText(false)} dismissible>
                      <Alert.Heading>Error</Alert.Heading>
                      <p>Please fill the text input!</p>
                    </Alert>
                  ) : undefined}
                </Col>
              </Row>
            </Tab.Container>
          </Col>
        </Row>
      ) : undefined}
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
    </>
  );
};

export default Lists;
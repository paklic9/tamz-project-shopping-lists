import * as React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Alert, Button, Col, ListGroup, OverlayTrigger, Popover, Row, Tab} from "react-bootstrap";
import useLists from "../hooks/useLists";
import {IEditItem, IList, IState} from "../types";
import {setNewItemButtonVisiblity} from "../actions";
import {audioOnClick, audioOnDelete} from "../components/lists/Sounds";
import Buttons from "../components/lists/Buttons";
import Table from "../components/lists/Table";

const Lists: React.FC = () => {
  const dispatch = useDispatch();
  const [newItem, setNewItem] = React.useState<boolean>(false);
  const [editItem, setEditItem] = React.useState<IEditItem | null>(null);
  const [editListObj, setEditListObj] = React.useState<IList | null>(null);
  const [newItemText, setNewItemText] = React.useState<string>('');
  const [newItemPriority, setNewItemPriority] = React.useState<boolean>(false);
  const [showErrorText, setShowErrorText] = React.useState(false);
  const {refetchLists, lists} = useLists();
  const newItemButtonVisiblity = useSelector<IState, boolean>(state => state.newItemButtonVisibility);

  const resetInputs = React.useCallback(() => {
    if (newItem) {
      (document.getElementById('priority') as HTMLInputElement).checked = false;
      (document.getElementById('textNew') as HTMLInputElement).value = "";
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

  const handleDeleteItemFromList = React.useCallback((key: IList['key'], detailId: number) => {
    const list: IList = JSON.parse(localStorage.getItem(key) as string);
    list.detail.splice(list.detail.findIndex(item => item.id === detailId), 1)
    const myJSON = JSON.stringify(list);
    localStorage.setItem(list.key, myJSON);
    refetchLists();
  }, [refetchLists])

  //type: 1=remove all lists, 2=remove selected list, 3=remove item from list
  const confirmDelete = React.useCallback((button: JSX.Element, type: number, listKey = "", detailId = 0) => {
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
  }, [handleClear, handleDeleteItemFromList, handleRemoveList])

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
                        href={list.key}
                        key={list.key}
                        style={editListObj?.key === list.key ? {
                          backgroundColor: 'rgb(0, 123, 255)',
                          color: 'rgb(255,255,255)'
                        } : {backgroundColor: 'rgb(220,220,220)', color: 'rgb(0,0,0)'}}
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
                      <Tab.Pane key={"list" + i} eventKey={list.key}>
                        <Table list={list} setNewItemText={setNewItemText} setNewItemPriority={setNewItemPriority}
                               resetInputs={resetInputs} newItem={newItem} confirmDelete={confirmDelete}
                               editItem={editItem} newItemPriority={newItemPriority} newItemText={newItemText}
                               setEditItem={setEditItem} setShowErrorText={setShowErrorText}/>
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
      <Buttons editListObj={editListObj} setEditListObj={setEditListObj} confirmDelete={confirmDelete}/>
    </>
  );
};

export default Lists;
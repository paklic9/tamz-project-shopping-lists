import * as React from 'react';
import {Link, Route, Switch, useHistory} from "react-router-dom";
import {Col, Container, Row} from "react-bootstrap";
import Lists from "./Lists";
import About from "./About";

const shopping_lists = require("../assets/apk/shopping_lists.apk");

const Layout: React.FC = () => {
  const {push} = useHistory();
  // const { pathname } = useLocation();

  return (
    <Container fluid>
      <Row className="header">
        <Col>
          <span className="title" onClick={() => push('/')}>
            Shopping lists
          </span>
        </Col>
      </Row>
      <Row className="content">
        <Col>
          <Switch>
            <Route path="/about" component={About}/>
            <Route path="/" component={Lists}/>
          </Switch>
        </Col>
      </Row>
      <Row className="footer">
        <Col>
          <div>
            Created by Vojtěch Zámečník
          </div>
          <div>
            <Link to="/about">About web</Link>
            {' | '}
            <a href={shopping_lists} download="shopping_lists.apk">Download apk</a>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
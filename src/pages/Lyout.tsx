import * as React from 'react';
import {Link, Route, Switch, useHistory, BrowserRouter} from "react-router-dom";
import {Col, Container, Row} from "react-bootstrap";
import Lists from "./Lists";
import About from "./About";

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
            <BrowserRouter basename={window.location.pathname || ''}>
              <Route path="/about" component={About}/>
              <Route path="/" component={Lists}/>
            </BrowserRouter>
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
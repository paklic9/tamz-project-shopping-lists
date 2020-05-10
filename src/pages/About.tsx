import * as React from 'react';
import {Button, Col, Row} from "react-bootstrap";
import {useHistory} from "react-router-dom";

const About: React.FC = () => {
  const {push} = useHistory();

  return (
    <div className="aboutPage">
      <Row>
        <Col>
          This app was created by student Vojtěch Zámečník in the subject TAMZ 1 (Creating applications for mobile devices) in the second year of studies.
        </Col>
      </Row>
      <Row>
        <Col>
          If you have any question, feel free to contact me on email: <a href = "mailto: vojtech.zamecnik.st@vsb.cz">vojtech.zamecnik.st@vsb.cz</a>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={() => push('/')}>
            Back to Home Page
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default About;
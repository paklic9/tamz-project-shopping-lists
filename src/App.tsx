import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './pages/Lyout';

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

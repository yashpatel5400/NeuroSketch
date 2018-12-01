import React, { Component } from 'react';
import { Navbar, NavbarBrand } from "mdbreact";
import './App.css';

class App extends Component {
  render() {
    return (
      <Navbar color="default-color" dark>
        <NavbarBrand>
          <strong className="white-text">NeuroSketch</strong>
        </NavbarBrand>
      </Navbar>
    );
  }
}

export default App;

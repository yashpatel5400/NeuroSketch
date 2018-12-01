import React, { Component } from 'react';
import { Navbar, NavbarBrand } from "mdbreact";
import { MDBBtn } from "mdbreact";
import './App.scss';

class App extends Component {
  render() {
    return (
      <div className="sidenav text-center">
        <Navbar dark>
          <NavbarBrand>
            <strong className="white-text">NeuroSketch</strong>
          </NavbarBrand>
        </Navbar>

        <MDBBtn outline color="info">Layer #1</MDBBtn>
        <MDBBtn outline color="info">Layer #2</MDBBtn>
        <MDBBtn outline color="info">Layer #3</MDBBtn>
      </div>
    );
  }
}

export default App;

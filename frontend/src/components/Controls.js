import React from 'react';
import { Navbar, NavbarBrand, NavbarNav, NavItem, NavLink, NavbarToggler, Collapse, FormInline, Dropdown, DropdownToggle, DropdownMenu,  DropdownItem } from "mdbreact";
import { MDBBtn } from "mdbreact";

export class Controls extends React.Component {
  render() {
    const { selectedNode, onShow, onUndo, onRedo, canUndo, canRedo } = this.props;
    const content = selectedNode ? JSON.stringify(selectedNode.serialize(), null, 2) : '';

  	return (
  	  <div className='controls'>
  	    <div>
  	      <MDBBtn onClick={onUndo} disabled={!canUndo}>Undo</MDBBtn>
  	      <MDBBtn onClick={onRedo} disabled={!canRedo}>Redo</MDBBtn>
          <MDBBtn onClick={onShow}>Show Model</MDBBtn>
  	    </div>
  	    <pre>
  	      {content}
  	    </pre>
    	</div>
  	);
  }
}

import React from 'react';
import { MDBBtn, NavbarBrand } from "mdbreact";
import { DragWrapper } from './DragWrapper';
import { OutputNodeWidget } from './nodes/output/OutputNodeWidget';
import { InputNodeWidget } from './nodes/input/InputNodeWidget';
import { ConnectionNodeWidget } from './nodes/connection/ConnectionNodeWidget';

class Node extends React.Component {
  renderNode() {
    const { type, color, name } = this.props;

    if (type === 'output') {
      return <OutputNodeWidget node={{ name: name }} displayOnly />;
    }
    if (type === 'input') {
      return <InputNodeWidget node={{ name: name }} displayOnly />;
    }
    if (type === 'connection') {
      return <ConnectionNodeWidget node={{ name: name }} color={color} displayOnly />;
    }
    console.warn('Unknown node type');
    return null;
  }

  render() {
    const { type, color, name } = this.props;
    
    return (
      <DragWrapper type={type} color={color} style={{ display: 'inline-block' }}>
        {this.renderNode()}
      </DragWrapper>
    );
  }
}

export class NodesPanel extends React.Component {
  render() {
    const { selectedNode, onShow, onUndo, onRedo, canUndo, canRedo } = this.props;

    return (
      <div className='nodes-panel'>
        <NavbarBrand>
          <strong className="white-text">NeuroSketch</strong>
        </NavbarBrand>

        <hr />

        <MDBBtn outline color="info" onClick={onUndo} disabled={!canUndo}><i className="fa fa-undo" aria-hidden="true"></i></MDBBtn>
        <MDBBtn outline color="info" onClick={onRedo} disabled={!canRedo}><i className="fa fa-repeat" aria-hidden="true"></i></MDBBtn>
        <MDBBtn outline color="info" onClick={onShow}><i className="fa fa-save" aria-hidden="true"></i></MDBBtn>

        <hr />
        
        <div className='node-wrapper'>
          <Node type='output' name='Data Node' />
        </div>

        <div className='node-wrapper'>
          <Node type='connection' color='rgb(224, 98, 20)' name='Dense Node' />
        </div>
        <div className='node-wrapper'>
          <Node type='connection' color='rgb(157, 13, 193)' name='Conv2D Node' />
        </div>
        <div className='node-wrapper'>
          <Node type='connection' color='rgb(12, 193, 180)' name='LSTM Node' />
        </div>
        
        <div className='node-wrapper'>
          <Node type='input' name='Output Node' />
        </div>
      </div>
    );
  }
}

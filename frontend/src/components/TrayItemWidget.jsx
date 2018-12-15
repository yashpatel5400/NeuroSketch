import * as React from "react";
import { MDBBtn } from "mdbreact";

export class TrayItemWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <MDBBtn outline
        draggable={true}
        onDragStart={event => {
          event.dataTransfer.setData("storm-diagram-node", JSON.stringify(this.props.model));
        }}
      >
        {this.props.name}
      </MDBBtn>
    );
  }
}

import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";

import * as SRD from "storm-react-diagrams";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

/**
 * @author Dylan Vorster
 */
export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      diagramEngine: new SRD.DiagramEngine()
    };
    this.state.diagramEngine.installDefaultFactories();
  }

  render() {
    return (
      <div className="body">
        <div className="content">
          <Nodes />
          <div
            className="diagram-layer"
            onDrop={event => {
              var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
              var node = new DefaultNodeModel(data.name, data.color);
              if (data.type === "in") {
                node.addInPort("In");
              } else if (data.type === "out") {
                node.addOutPort("Out");
              } else {
                node.addInPort("In");
                node.addOutPort("Out");
              }

              var points = this.state.diagramEngine.getRelativeMousePoint(event);
              node.x = points.x;
              node.y = points.y;
              this.state.diagramEngine
                .getDiagramModel()
                .addNode(node);
              this.forceUpdate();
            }}
            onDragOver={event => {
              event.preventDefault();
            }}
          >
            <DiagramWidget className="srd-demo-canvas" diagramEngine={this.state.diagramEngine} />
          </div>
        </div>
      </div>
    );
  }
}

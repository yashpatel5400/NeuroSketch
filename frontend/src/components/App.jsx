import * as React from "react";
import * as _ from "lodash";
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
              var nodesCount = _.keys(
                this.state.diagramEngine
                  .getDiagramModel()
                  .getNodes()
              ).length;

              var node = null;
              if (data.type === "in") {
                node = new DefaultNodeModel("Node " + (nodesCount + 1), data.color);
                node.addInPort("In");
              } else if (data.type === "out") {
                node = new DefaultNodeModel("Node " + (nodesCount + 1), data.color);
                node.addOutPort("Out");
              } else {
                node = new DefaultNodeModel("Node " + (nodesCount + 1), data.color);
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

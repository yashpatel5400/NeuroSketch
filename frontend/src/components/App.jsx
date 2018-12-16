import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";
import Graph from "graph-data-structure";
import { MDBBtn, Navbar, NavbarBrand, NavbarNav, NavItem, FormInline } from "mdbreact";
import * as SRD from "storm-react-diagrams";
import $ from "jquery";

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

  compileGraph() {
    var graph = Graph();

    var nodes = Object.keys(this.state.diagramEngine.diagramModel.nodes); 
    for (var i = 0; i < nodes.length; i++) {
      graph.addNode(nodes[i]);
    }

    var edges = this.state.diagramEngine.diagramModel.links;
    var edgeIds = Object.keys(edges);
    for (i = 0; i < edgeIds.length; i++) {
      // editor allows you to draw unterminated edges, which we ignore for the graph
      if (edges[edgeIds[i]].targetPort == null) {
        continue;
      }

      // editor allows drawing edges from in -> out or out -> in, so we account for both
      var srcLabel = edges[edgeIds[i]].sourcePort.label;
      var src, dst;
      if (srcLabel === "In") {
        src = edges[edgeIds[i]].sourcePort.id;
        dst = edges[edgeIds[i]].targetPort.id;
      } else {
        src = edges[edgeIds[i]].targetPort.id;
        dst = edges[edgeIds[i]].sourcePort.id;
      }

      graph.addEdge(src, dst);
    }
    return graph.serialize();
  }

  render() {
    return (
      <div>
        <Navbar color="unique-color-dark">
          <NavbarBrand>
            <strong className="white-text">NeuroSketch</strong>
          </NavbarBrand>

          <NavbarNav left>
            <NavItem>
              <FormInline waves>
                <div className="md-form my-0">
                  <input
                    className="form-control mr-sm-2"
                    type="text"
                    placeholder="Search"
                    aria-label="Search"
                  />
                </div>
              </FormInline>
            </NavItem>
          </NavbarNav>

          <NavbarNav right>
            <NavItem>
              <MDBBtn outline onClick={() => {
                $.ajax({
                  url:"compile", 
                  type: "post",
                  dataType: 'json',
                  data: JSON.stringify(this.compileGraph())
                });
              }}>
                Compile
              </MDBBtn>
            </NavItem>
          </NavbarNav>
        </Navbar>

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
      </div>
    );
  }
}

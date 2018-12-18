import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";
import { MDBBtn, Navbar, NavbarBrand, NavbarNav, NavItem, FormInline, ModalHeader, ModalBody, Modal } from "mdbreact";
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
      search: "",
      diagramEngine: new SRD.DiagramEngine(),
      modal8: false
    };
    this.state.diagramEngine.installDefaultFactories();

    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  compileGraph() {
    var nodes = this.state.diagramEngine.diagramModel.nodes;
    var nodeIds = Object.keys(nodes);
    
    var nodeProperties = [];
    for (var i = 0; i < nodeIds.length; i++) {
      nodeProperties.push(nodes[nodeIds[i]].name);
    }

    var edges = this.state.diagramEngine.diagramModel.links;
    var edgeIds = Object.keys(edges);
    var fixedEdges = [];
    for (i = 0; i < edgeIds.length; i++) {
      // editor allows you to draw unterminated edges, which we ignore for the graph
      if (edges[edgeIds[i]].targetPort == null) {
        continue;
      }

      // editor allows drawing edges from in -> out or out -> in, so we account for both
      var srcLabel = edges[edgeIds[i]].sourcePort.label;
      var src, dst;
      if (srcLabel === "In") {
        src = edges[edgeIds[i]].sourcePort.parent.id;
        dst = edges[edgeIds[i]].targetPort.parent.id;
      } else {
        src = edges[edgeIds[i]].targetPort.parent.id;
        dst = edges[edgeIds[i]].sourcePort.parent.id;
      }

      fixedEdges.push([src, dst]);
    }
    
    var graph = {
      nodes : nodeIds,
      nodeProps : nodeProperties,
      edges : fixedEdges,
    }
    return graph;
  }

  toggle(nr) {
    console.log("inside")
    let modalNumber = 'modal' + nr
    this.setState({
      [modalNumber]: !this.state[modalNumber]
    });
  }

  handleChange(event) {
    this.setState({search: event.target.value});
  }

  handleClick(e) {
    if (document.getElementsByClassName("srd-node--selected").length == 1) {
      this.toggle(8);
    }
  }

  render() {
    return (
      <div onClick={this.handleClick}>
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
                    placeholder="Search" 
                    value={this.state.search}
                    type="text" 
                    onChange={this.handleChange} />
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
            <Nodes search={ this.state.search } />
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

        <Modal isOpen={this.state.modal8} toggle={() => this.toggle(8)} fullHeight position="right">
          <ModalHeader toggle={() => this.toggle(8)}>Modal title</ModalHeader>
          <ModalBody>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

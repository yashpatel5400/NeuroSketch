import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";
import { MDBTooltip, MDBBtn, Navbar, NavbarBrand, NavbarNav, NavItem, FormInline, ModalHeader, Modal } from "mdbreact";
import * as SRD from "storm-react-diagrams";
import $ from "jquery";

import layersToArgs from '../properties/layers.json';
import argsOptions from '../properties/options.json';
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

      argsPanel: false,
      selectedNodeType: "",
      selectedNodeArgs: "",
      selectedNodeArgsDescriptions: ""
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

  toggle() {
    this.setState({
      selectedNodeId: "",
      argsPanel: !this.state.argsPanel
    });
  }

  handleChange(event) {
    this.setState({search: event.target.value});
  }

  handleClick(e) {
    // really jank way of getting around the fact this is buried in the storm-diagrams
    var selectedNodes = document.getElementsByClassName("srd-node--selected");
    if (selectedNodes.length === 1) {
      if (!this.state.argsPanel) {
        var nodeType = selectedNodes[0].innerText.split("\n")[0];
        var argDescriptions = layersToArgs[nodeType];

        this.setState({
          selectedNodeType: nodeType,
          selectedNodeArgs: Object.keys(argDescriptions),
          selectedNodeArgsDescriptions: Object.values(argDescriptions),
          argsPanel: true
        });
      } 
    } 
  }

  render() {
    var argFields = [];
    for (var i = 0; i < this.state.selectedNodeArgs.length; i++) {
      var fieldsWithOptions = Object.keys(argsOptions);
      var discreteOptionField = false;
      var content;

      for (var j = 0; j < fieldsWithOptions.length; j++) {
        var field = fieldsWithOptions[j];
        var lowerDescription = this.state.selectedNodeArgsDescriptions[i].toLowerCase();
        if (lowerDescription.indexOf(field) !== -1) {
          var defaultInstance = lowerDescription.indexOf("default");
          if (defaultInstance !== -1) {
            var uncleanDefaultValue = lowerDescription.substr(defaultInstance).trim();
            var defaultValue = uncleanDefaultValue.split(" ")[0];
            console.log(defaultValue)
          }

          var options = Object.keys(argsOptions[field]);
          var optionFields = [];
          for (var j = 0; j < options.length; j++) {
            optionFields.push(<option value={ options[j] }>{ options[j] }</option>)
          }

          content = <select>{ optionFields }</select>;
          discreteOptionField = true;
        }
        
        if (discreteOptionField) {
          break;
        }
      }

      if (!discreteOptionField) {
        content = <input className="form-control mr-sm-2"type="text" />
      }

      argFields.push(<div>
          <MDBTooltip
            placement="bottom"
            tooltipContent={ this.state.selectedNodeArgsDescriptions[i] }>
            { this.state.selectedNodeArgs[i] } : { content } <br />
          </MDBTooltip> 
        </div>)
    }

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

        <Modal isOpen={ this.state.argsPanel } toggle={() => this.toggle()} fullHeight position="right">
          <ModalHeader toggle={() => this.toggle()}>{ this.state.selectedNodeType }</ModalHeader>
          <FormInline waves>
            <div className="md-form my-0">
              { argFields }
            </div>
          </FormInline>
        </Modal>
      </div>
    );
  }
}

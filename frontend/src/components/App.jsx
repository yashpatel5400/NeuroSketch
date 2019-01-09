import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";
import { MDBTooltip, MDBBtn, Navbar, NavbarBrand, NavbarNav, NavItem, FormInline, ModalHeader, Modal } from "mdbreact";
import * as SRD from "storm-react-diagrams";
import $ from "jquery";

import layersToArgSplit from '../properties/arg_split.json';
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
      selectedNode: undefined
    };
    this.state.diagramEngine.installDefaultFactories();

    this.handleClick = this.handleClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  compileGraph() {
    var nodes = this.state.diagramEngine.diagramModel.nodes;
    var nodeIds = Object.keys(nodes);
    
    var nodeProperties = [];
    for (var i = 0; i < nodeIds.length; i++) {
      var node = nodes[nodeIds[i]];
      var property = {
        name : node.name,
        args : node.args
      }

      nodeProperties.push(property);
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

    console.log(nodeProperties)

    var graph = {
      nodes : nodeIds,
      nodeProps : nodeProperties,
      edges : fixedEdges,
    }
    return graph;
  }

  toggle() {
    this.setState({
      selectedNode: undefined,
      argsPanel: !this.state.argsPanel
    });
  }

  handleSearch(event) {
    this.setState({search: event.target.value});
  }

  handleClick(e) {
    // really jank way of getting around the fact this is buried in the storm-diagrams
    var selectedNodes = document.getElementsByClassName("srd-node--selected");
    if (selectedNodes.length === 1) {
      if (this.state.selectedNode == undefined) {
        var nodeId = selectedNodes[0].getAttribute("data-nodeid");
        var node = this.state.diagramEngine.diagramModel.nodes[nodeId];
        this.setState({
          selectedNode : node,
          argsPanel : true
        })
      }
    } 
  }

  render() {
    var argFields = [];
    if (this.state.selectedNode !== undefined) {
      var selectedNodeArgs = Object.keys(this.state.selectedNode.args);
      for (var i = 0; i < selectedNodeArgs.length; i++) {
        var arg = this.state.selectedNode.args[selectedNodeArgs[i]];

        var fieldsWithOptions = Object.keys(argsOptions);
        var discreteOptionField = false;
        var content;

        for (var j = 0; j < fieldsWithOptions.length; j++) {
          var field = fieldsWithOptions[j];
          var lowerDescription = arg.description.toLowerCase();
          if (lowerDescription.indexOf(field) !== -1) {
            var options = Object.keys(argsOptions[field]);
            var optionFields = [];
            for (var j = 0; j < options.length; j++) {
              optionFields.push(<option value={ options[j] }>{ options[j] }</option>)
            }

            content = <select name={ selectedNodeArgs[i] } value={ arg.value } onChange={ (event) => { 
              this.state.selectedNode.args[event.target.name].value = event.target.value 
            }}>{ optionFields }</select>;
            discreteOptionField = true;
          }
          
          if (discreteOptionField) {
            break;
          }
        }

        if (!discreteOptionField) {
          content = <input className="form-control mr-sm-2" name={ selectedNodeArgs[i] } type="text" value={ arg.value } onChange={ (event) => { 
            this.state.selectedNode.args[event.target.name].value = event.target.value 
          }} />
        }

        argFields.push(<div>
            <MDBTooltip
              placement="bottom"
              tooltipContent={ arg.description }>
              { selectedNodeArgs[i] } : { content } <br />
            </MDBTooltip> 
          </div>)
      }
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
                    onChange={this.handleSearch} />
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

              <MDBBtn outline>Load Model</MDBBtn>
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

                var argDescriptions = layersToArgs[data.name];
                var argsSplit = layersToArgSplit[data.name];
                
                node.args = {};

                // argsSplit[0] contains all the required arguments for the layer
                for (var i = 0; i < argsSplit[0].length; i++) {
                  var arg = argsSplit[0][i];
                  node.args[arg] = {
                    description: argDescriptions[arg],
                    required: true,
                    value: ""
                  };
                }

                // argsSplit[1] contains all the optional arguments
                for (i = 0; i < argsSplit[1].length; i++) {
                  arg = argsSplit[1][i];
                  var description = argDescriptions[arg];
                  var lowerDescription = description.toLowerCase();
                  var defaultInstance = lowerDescription.indexOf("default");

                  var defaultValue = "";
                  if (defaultInstance !== -1) {
                    var uncleanDefaultValue = lowerDescription.substr(defaultInstance).trim();
                    defaultValue = uncleanDefaultValue.split(" ")[0];
                  }

                  node.args[arg] = {
                    description: description,
                    required: false,
                    value: defaultValue
                  };
                }
                
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

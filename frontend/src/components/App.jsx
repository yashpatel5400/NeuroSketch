import * as React from "react";
import { Nodes } from "./Nodes";
import { DefaultNodeModel, DiagramWidget } from "storm-react-diagrams";
import { MDBTooltip, MDBBtn, Navbar, NavbarBrand, NavbarNav, NavItem, FormInline, ModalHeader, Modal } from "mdbreact";
import * as SRD from "storm-react-diagrams";
import $ from "jquery";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBModalFooter,
  MDBIcon,
  MDBCardHeader,
  MDBInput
} from "mdbreact";
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";

import layersToArgDefaults from '../properties/layer_defaults.json';
import layersToArgs from '../properties/layers.json';
import argsOptions from '../properties/options.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

function saveJSON(data, filename){
  if (!data) {
    console.error('No data')
    return;
  }

  if (!filename) filename = 'console.json'

  if (typeof data === "object"){
    data = JSON.stringify(data, undefined, 4)
  }

  var blob = new Blob([data], {type: 'text/json'}),
    e    = document.createEvent('MouseEvents'),
    a    = document.createElement('a')

  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      diagramEngine: new SRD.DiagramEngine(),

      selectedNode: undefined,
      exportModelType: "Caffe",
      uploadData: "",
      uploadingData: false
    };
    this.state.diagramEngine.installDefaultFactories();

    this.handleClick = this.handleClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleModelSelect = this.handleModelSelect.bind(this);
    this.getArgOptions = this.getArgOptions.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleUpload = this.toggleUpload.bind(this);
    this.handleUploadDataChange = this.handleUploadDataChange.bind(this);
    this.decompileGraph = this.decompileGraph.bind(this);
    this.createNode = this.createNode.bind(this);
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
      if (srcLabel === "Out") {
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
      exportModelType: this.state.exportModelType
    }
    saveJSON(graph, "graph.json")
    return graph;
  }

  createNode(data, points) {
    var node = new DefaultNodeModel(data.name, data.color);
    if (data.type === "in") {
      node.addInPort("In");
    } else if (data.type === "out") {
      node.addOutPort("Out");
    } else {
      node.addInPort("In");
      node.addOutPort("Out");
    }

    var argDescriptions = layersToArgs[data.name];
    var argsToDefault = layersToArgDefaults[data.name];
    var args = Object.keys(argsToDefault);

    node.args = {};

    // argsSplit[0] contains all the required arguments for the layer
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var description = argDescriptions[arg];
      
      var defaultValue = argsToDefault[arg];
      var required = defaultValue == ""; // required args don't have default
      var options = this.getArgOptions(description);

      // if we specify "None", it's either because there's an option of None or it's 
      // supposed to be an empty text field (even if not required)
      if (defaultValue == "None") {
        if (options.length > 0) {
          options.insert(0, defaultValue);
        } else {
          defaultValue = "";
        }
      }

      node.args[arg] = {
        description: description,
        required: required, 
        value: defaultValue,
        options: options
      };
    }
    
    if (points !== undefined) {
      node.x = points.x;
      node.y = points.y;
    } else {
      node.x = 0;
      node.y = 0;
    }

    this.state.diagramEngine
      .getDiagramModel()
      .addNode(node);
    this.forceUpdate();
    return node;
  }

  decompileGraph() {
    // var graph = JSON.parse(this.state.uploadData);
    var testData = {
      "color": "#ff4444",
      "name": "Dense",
      "type": "inout"
    }
    this.createNode(testData)
    this.setState({ uploadingData: false });
  }

  toggle() {
    this.setState({ selectedNode: undefined });
  }

  toggleUpload() {
    this.setState({ uploadingData: !this.state.uploadingData });
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
          selectedNode : node
        })
      }
    } 
  }

  handleChange(event) {
    var updatedSelectedNode = this.state.selectedNode;
    updatedSelectedNode.args[event.target.name].value = event.target.value;
    this.setState({ selectedNode : updatedSelectedNode });
  }

  handleUploadDataChange(event) {
    this.setState({ uploadData : event.target.value });
  }

  handleModelSelect(event) {
    this.setState({ exportModelType : event.target.name });
  }

  getArgOptions(description) {
    var fieldsWithOptions = Object.keys(argsOptions);
    var discreteOptionField = false;
    var options = [];
    for (var j = 0; j < fieldsWithOptions.length; j++) {
      var field = fieldsWithOptions[j];
      var lowerDescription = description.toLowerCase();
      if (lowerDescription.indexOf(field) !== -1) {
        options = Object.keys(argsOptions[field]);
        discreteOptionField = true;
      }
      
      if (discreteOptionField) {
        break;
      }
    }
    return options;
  }

  render() {
    var argFields = [];
    var canSaveParams = true; // ensures all required fields are filled before closing panel

    if (this.state.selectedNode !== undefined) {
      var selectedNodeArgs = Object.keys(this.state.selectedNode.args);
      for (var i = 0; i < selectedNodeArgs.length; i++) {
        var arg = this.state.selectedNode.args[selectedNodeArgs[i]];

        var fieldsWithOptions = Object.keys(argsOptions);
        var discreteOptionField = false;
        var content;
        if (arg.required && arg.value == "") {
          canSaveParams = false;
        }

        if (arg.options.length > 0) {
          var options = [];
          for (var j = 0; j < arg.options.length; j++) {
            options.push(<option value={ arg.options[j] }>{ arg.options[j] }</option>)
          }

          content = <select validate 
              name={ selectedNodeArgs[i] } 
              value={ arg.value } 
              onChange={ this.handleChange }
              required={ arg.required } >
            { options }
          </select>;
        } else {
          var inputType = "text";
          if (arg.description.indexOf("float") != -1 ||
              arg.description.indexOf("integer") != -1 ||
              arg.description.indexOf("number") != -1) {
            inputType = "number";
          }
          content = <input validate
            type={ inputType }
            name={ selectedNodeArgs[i] } 
            value={ arg.value } 
            onChange={ this.handleChange } 
            required={ arg.required } />
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

              <form action={`/download/${this.state.exportModelType}`} method="POST">
                <MDBBtn outline type="submit"> Download </MDBBtn>
              </form>

              <MDBBtn outline onClick={ this.toggleUpload } > Upload </MDBBtn>

              <MDBDropdown>
                <MDBDropdownToggle outline caret color="default" onChange={this.handleModelSelect}>
                  { this.state.exportModelType }
                </MDBDropdownToggle>
                <MDBDropdownMenu basic>
                  <MDBDropdownItem name="Tensorflow" onClick={this.handleModelSelect}>Tensorflow</MDBDropdownItem>
                  <MDBDropdownItem name="CNTK" onClick={this.handleModelSelect}>CNTK</MDBDropdownItem>
                  <MDBDropdownItem name="Keras" onClick={this.handleModelSelect}>Keras</MDBDropdownItem>
                  <MDBDropdownItem name="Caffe" onClick={this.handleModelSelect}>Caffe</MDBDropdownItem>
                  <MDBDropdownItem name="PyTorch" onClick={this.handleModelSelect}>PyTorch</MDBDropdownItem>
                  <MDBDropdownItem name="MXNet" onClick={this.handleModelSelect}>MXNet</MDBDropdownItem>
                  <MDBDropdownItem name="CoreML" onClick={this.handleModelSelect}>CoreML</MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
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
                var points = this.state.diagramEngine.getRelativeMousePoint(event);
                var node = this.createNode(data, points);
                this.setState({ selectedNode : node });
              }}
              onDragOver={event => {
                event.preventDefault();
              }}
            >
              <DiagramWidget className="srd-demo-canvas" diagramEngine={this.state.diagramEngine} />
            </div>
          </div>
        </div>

        <Modal  isOpen={ this.state.selectedNode !== undefined } 
                toggle={() => {if (canSaveParams) this.toggle()}} fullHeight position="right">
          <MDBRow>
            <MDBCol md="12">
              <MDBCard>
                <MDBCardBody>
                  <form>
                    <div className="grey-text">
                      { argFields }
                    </div>
                  </form>
                </MDBCardBody>

                <MDBModalFooter>
                  <MDBBtn className="mb-6" disabled={ !canSaveParams } onClick={ this.toggle }> Save </MDBBtn>
                </MDBModalFooter>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </Modal>

        <Modal  isOpen={ this.state.uploadingData } 
                toggle={ this.toggleUpload }>
          <MDBRow>
            <MDBCol md="12">
              <MDBCard>
                <MDBCardBody>
                  <MDBInput label="Graph model" onChange={ this.handleUploadDataChange } />
                  <MDBBtn outline onClick={ this.decompileGraph } >
                    Compile Graph
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </Modal>
      </div>
    );
  }
}

import * as SRD from "storm-react-diagrams";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

/**
 * @author Dylan Vorster
 */
export class Application {
  constructor() {
    this.diagramEngine = new SRD.DiagramEngine();
    this.diagramEngine.installDefaultFactories();

  }

  getDiagramEngine() {
    return this.diagramEngine;
  }
}

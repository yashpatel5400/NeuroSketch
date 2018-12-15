import * as SRD from "storm-react-diagrams";

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

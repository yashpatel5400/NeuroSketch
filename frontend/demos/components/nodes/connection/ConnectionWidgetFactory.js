import { NodeWidgetFactory } from 'react-js-diagrams';
import { ConnectionNodeWidgetFactory } from './ConnectionNodeWidget';

export class ConnectionWidgetFactory extends NodeWidgetFactory{
  constructor() {
    super('connection');
  }

  generateReactWidget(diagramEngine, node) {
    return ConnectionNodeWidgetFactory({ node });
  }
}

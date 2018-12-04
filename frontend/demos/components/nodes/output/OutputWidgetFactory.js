import { NodeWidgetFactory } from 'react-js-diagrams';
import { OutputNodeWidgetFactory } from './OutputNodeWidget';

export class OutputWidgetFactory extends NodeWidgetFactory{
  constructor() {
    super('output');
  }

  generateReactWidget(diagramEngine, node) {
    return OutputNodeWidgetFactory({ node });
  }
}

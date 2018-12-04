import { NodeWidgetFactory } from 'react-js-diagrams';
import { InputNodeWidgetFactory } from './InputNodeWidget';

export class InputWidgetFactory extends NodeWidgetFactory{
  constructor() {
    super('input');
  }

  generateReactWidget(diagramEngine, node) {
    return InputNodeWidgetFactory({ node });
  }
}

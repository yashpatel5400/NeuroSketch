import { AbstractInstanceFactory } from 'react-js-diagrams';
import { OutputNodeModel } from './OutputNodeModel';

export class OutputNodeFactory extends AbstractInstanceFactory {
  constructor() {
    super('OutputNodeModel');
  }

  getInstance() {
    return new OutputNodeModel();
  }
}
